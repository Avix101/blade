const models = require('../models');
const profilePics = require('./profiles.js');

const { Account } = models;

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

// Sign a user up
const signup = (request, response) => {
  const req = request;
  const res = response;

  // Cast params to strings for the sake of security
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;
  req.body.profile_name = `${req.body.profile_name}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
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
  logout,
  signup,
  updatePassword,
  updateIcon,
  getToken,
};
