// Import node modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

// Custom controllers
const controllers = require('./controllers');

// Custom middleware
const mid = require('./middleware');

// Attach routes to the main express application
const attach = (app) => {
  // Provide access to psuedo-directory /assets which maps to static assets in /hosted
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

  // Provide a favicon when the browser requests it
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));

  // Handle main http requests
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/getProfiles', mid.requiresSecure, mid.requiresLogout, controllers.Blade.getAllProfilePics);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/blade', mid.requiresLogin, controllers.Blade.main);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = {
  attach,
};
