const models = require('../models');
const profilePics = require('./profiles.js');

const { Account } = models;
let guestNumber = 1;

// Import and setup Reddit Oauth
const RedditApi = require('reddit-oauth');

const reddit = new RedditApi({
  app_id: process.env.REDDIT_APP_ID,
  app_secret: process.env.REDDIT_APP_SECRET,
  redirect_uri: process.env.REDDIT_REDIRECT_URI,
});

// Crypto library for the random bytes
const crypto = require('crypto');

// Render the login page and send a csrf token
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// Log a user out
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// Log a user in
const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  // Verify input
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Authenticate the user
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/blade' });
  });
};

// Start the login process for a reddit user
const redditLogin = (req, res) => {
  // Grab a redirect uri for the user to authenticate with (reddit-side)
  const randomState = crypto.randomBytes(32).toString('hex');
  const redirectUri = reddit.oAuthUrl(randomState, 'identity');

  // Store the user's state for when the auth completes
  req.session.redditState = randomState;

  // If the redirect uri was generated, redirect the user
  if (redirectUri) {
    return res.status(200).json({ redirect: redirectUri });
  }

  // Alert the user if the login attempt failed
  return res.status(400).json({ error: 'reddit login attempt failed' });
};

// Grab the auth back from reddit and exchange it for an access and refresh token
const redditAuth = (req, res) => {
  reddit.oAuthTokens(req.session.redditState, req.query, () => {
    reddit.get('/api/v1/me', {}, (err, response, data) => {
      if (err) {
        return res.status(400).json({ error: 'reddit login attempt failed' });
      }

      const body = JSON.parse(data);
      const username = `r_${body.name}`;
      const id = `${body.id}`;

      // Attempt to find the account by its reddit id
      return Account.AccountModel.findByRedditId(id, (er2, account) => {
        if (er2) {
          return res.status(400).json({ error: 'reddit login attempt failed' });
        }

        // If the account exists, use it
        if (account) {
          req.session.account = Account.AccountModel.toAPI(account);
          return res.redirect('/blade');
        }

        // Password and salt data for reddit accounts will never be utilized
        const randomPassword = crypto.randomBytes(30).toString('hex');
        const randomSalt = crypto.randomBytes(30).toString('hex');

        // Create a new account if one doesn't exist
        const accountData = {
          username,
          reddit_id: id,
          salt: randomSalt,
          password: randomPassword,
          profile_name: 'alfin',
        };

        const newAccount = new Account.AccountModel(accountData);
        const savePromise = newAccount.save();

        savePromise.then(() => {
          req.session.account = Account.AccountModel.toAPI(newAccount);
          res.redirect('/blade');
        });

        return savePromise.catch(() => {
          res.status(500).json({ error: 'An error occured' });
        });
      });
    });
  });
};

// Login a user as a guest
const guestLogin = (req, res) => {
  Account.AccountModel.findByUsername('Guest', (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Guest accounts not enabled' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    // Give the guest a unique username
    req.session.account.username = `${req.session.account.username}#${guestNumber}`;
    guestNumber++;

    return res.json({ redirect: '/blade' });
  });
};

// Sign a user up
const signup = (request, response) => {
  const req = request;
  const res = response;

  // Cast params to strings for the sake of security
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;
  req.body.profile_name = `${req.body.profile_name}`;
  req.body.pass_warning_ack = `${req.body.pass_warning_ack}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.username.charAt(0) === 'r' && req.body.username.charAt(1) === '_') {
    return res.status(400).json({ error: 'r_ usernames are reserved for reddit users' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (req.body.pass_warning_ack !== 'on') {
    return res.status(400).json({
      error: 'You must accept the password acknowledgement to create an account',
    });
  }

  if (!profilePics[req.body.profile_name]) {
    return res.status(400).json({ error: 'Profile icon not accepted' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
      profile_name: req.body.profile_name,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    // Save to the database, process a response or handle an error
    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      res.json({ redirect: '/blade' });
    });

    savePromise.catch((err) => {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

// Update a user's password
const updatePassword = (request, response) => {
  const req = request;
  const res = response;

  req.body.newPassword = `${req.body.newPassword}`;
  req.body.newPassword2 = `${req.body.newPassword2}`;
  req.body.password = `${req.body.password}`;
  const { username } = req.session.account;

  if (req.body.newPassword !== req.body.newPassword2) {
    return res.status(400).json({ error: 'Password and confirmation password must match' });
  }

  // Check their old password
  return Account.AccountModel.authenticate(username, req.body.password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong current password' });
    }

    // Generate the hash and salt for the new password
    return Account.AccountModel.generateHash(req.body.newPassword, (salt, hash) => {
      const acc = account;
      acc.password = hash;
      acc.salt = salt;

      const savePromise = acc.save();

      // Save the new password
      savePromise.then(() => {
        req.session.account = Account.AccountModel.toAPI(account);
        res.status(204).send();
      });

      savePromise.catch(() => res.status(500).json({ error: 'Password could not be updated.' }));
    });
  });
};

// Update a user's icon
const updateIcon = (request, response) => {
  const req = request;
  const res = response;

  req.body.profile_name = `${req.body.profile_name}`;

  if (!profilePics[req.body.profile_name]) {
    return res.status(400).json({ error: 'Profile icon not accepted' });
  }

  return Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if (err || !acc) {
      return res.status(401).json({ error: 'Account not found' });
    }

    const account = acc;
    account.profile_name = req.body.profile_name;

    const savePromise = account.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(account);
      res.status(204).send();
    });

    return savePromise.catch(() => res.status(500).json({ error: 'Icon could not be updated.' }));
  });
};

// Update a user's privacy mode status
const updatePrivacy = (request, response) => {
  const req = request;
  const res = response;

  req.body.privacy = `${req.body.privacy}`;

  // Ensure the value is a boolean
  if (req.body.privacy === 'true') {
    req.body.privacy = true;
  } else {
    req.body.privacy = false;
  }

  return Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if (err || !acc) {
      return res.status(401).json({ error: 'Account not found' });
    }

    const account = acc;
    account.privacy = req.body.privacy;

    const savePromise = account.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(account);
      res.status(204).send();
    });

    return savePromise.catch(() => res.status(500).json({ error: 'Privacy mode could not be updated.' }));
  });
};

// Generate a new csrf token for a user
const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports = {
  loginPage,
  login,
  guestLogin,
  redditLogin,
  redditAuth,
  logout,
  signup,
  updatePassword,
  updateIcon,
  updatePrivacy,
  getToken,
};
