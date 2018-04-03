// Import node modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

// Custom controllers
const controllers = require('./controllers');

// Attach routes to the main express application
const attach = (app) => {
  // Provide access to psuedo-directory /assets which maps to static assets in /hosted
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

  // Provide a favicon when the browser requests it
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));

  // Handle main page requests (change later)
  app.get('/', controllers.Blade.main);
};

module.exports = {
  attach,
};
