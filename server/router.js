// Import node modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const rateLimiter = require('express-rate-limit');
const RedisForRateLimiting = require('rate-limit-redis');

// Custom controllers
const controllers = require('./controllers');

// Custom middleware
const mid = require('./middleware');

// Create rate limiters
let loginLimiter, createAccountLimiter;

// Utilize shared redis instance
const linkMem = (redisClient) => {
  // Create request limiters
  loginLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 Hour
    max: 10,
    store: new RedisForRateLimiting({
      client: redisClient
    }),
    skipSuccessfulRequests: true,
    message: {error: "Too many failed login attempts, please try again later"}
  });

  createAccountLimiter = rateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 1 Day
    max: 5,
    store: new RedisForRateLimiting({
      client: redisClient,
    }),
    skipFailedRequests: true,
    message: {error: "Too many accounts created, try again later"}
  });
};


// Attach routes to the main express application
const attach = (app) => {
  // Provide access to psuedo-directory /assets which maps to static assets in /hosted
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

  // Provide access to /webfonts inside of hosted for fontawesome
  app.use('/webfonts', express.static(path.resolve(`${__dirname}/../hosted/webfonts/`)));

  // Provide a favicon when the browser requests it
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));

  // Handle main http requests (GET and POST)
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/guestLogin', mid.requiresSecure, mid.requiresLogout, controllers.Account.guestLogin);
  app.get('/redditLogin', mid.requiresSecure, mid.requiresLogout, controllers.Account.redditLogin);
  app.get('/auth/reddit', mid.requiresSecure, mid.requiresLogout, controllers.Account.redditAuth);
  app.post('/login', mid.requiresSecure, mid.requiresLogout,
    loginLimiter, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout,
    createAccountLimiter, controllers.Account.signup);
  app.post('/changePassword', mid.requiresNonGuestLogin, controllers.Account.updatePassword);
  app.post('/changeIcon', mid.requiresNonGuestLogin, controllers.Account.updateIcon);
  app.post('/changePrivacy', mid.requiresNonGuestLogin, controllers.Account.updatePrivacy);
  app.post('/changeGamePrivacy', mid.requiresNonGuestLogin, controllers.Blade.updateGamePrivacy);
  app.post('/feedback', mid.requiresNonGuestLogin, controllers.Blade.submitFeedback);
  app.get('/getProfile', mid.requiresLogin, controllers.Blade.getProfile);
  app.get('/getProfiles', mid.requiresSecure, controllers.Blade.getAllProfilePics);
  app.get('/getGameHistory', mid.requiresNonGuestLogin, controllers.Blade.getGameHistory);
  app.get('/getPublicGames', mid.requiresLogin, controllers.Blade.getPublicGames);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/blade', mid.requiresLogin, controllers.Blade.main);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // In the event that none of the above match, run the notFound middleware
  app.get('*', mid.notFound);
};

module.exports = {
  attach,
  linkMem,
};
