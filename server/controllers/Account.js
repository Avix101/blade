const models = require('../models');
const profilePics = require('./profiles.js');

const { Account } = models;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/blade' });
  });
};

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

  return Account.AccountModel.authenticate(username, req.body.password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong current password' });
    }

    return Account.AccountModel.generateHash(req.body.newPassword, (salt, hash) => {
      const acc = account;
      acc.password = hash;
      acc.salt = salt;

      const savePromise = acc.save();

      savePromise.then(() => {
        req.session.account = Account.AccountModel.toAPI(account);
        res.status(204).send();
      });

      savePromise.catch(() => res.status(500).json({ error: 'Password could not be updated.' }));
    });
  });
};

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
  getToken,
};
