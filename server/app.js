// Basic http module
const http = require('http');

// Import express and custom router
const express = require('express');
const router = require('./router.js');

// Import Socket.io library and custom handler
const socketLib = require('socket.io');
const socketHandler = require('./socketHandler.js');

// Import handlebars viewing engine
const expressHandlebars = require('express-handlebars');

// Define a port based on the current environment
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Create the express application
const app = express();

// Configure application
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

// Attach routes to the application
router.attach(app);

// Create a server for http traffic
const server = http.createServer(app);

// Attach Socket.io lib to main server and attach custom events to Socket.io lib
const io = socketLib(server);
socketHandler.init(io);

server.listen(port);
