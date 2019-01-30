// Import necessary modules
const http = require('http');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf');
const helmet = require('helmet');

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

// Define a database url
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/DomoMaker';

// Define redis secret
const redisSecret = process.env.REDIS_SECRET || 'mysecretkey';

// Connect to Mongo DB using mongoose
mongoose.connect(dbURL, (err) => {
  if (err) {
    throw err;
  }
});

// Grab environment variables for redis if they exist
let redisURL;
let redisPASS;

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  [, redisPASS] = redisURL.auth.split(':');
} else {
  redisURL = {
    hostname: 'localhost',
    port: 6379,
  };
}

// Create the express application
const app = express();

// Configure application
app.disable('x-powered-by');

// Attach custom x-powered-by middleware just for fun
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Orbal Energy');

  next();
});

// Enable helmet protections
app.use(helmet());

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie expiration date (1 day)
const expiryDate = new Date(Date.now() + (24 * 60 * 60 * 1000));

// Create Redis client
const redisClient = new RedisStore({
  host: redisURL.hostname,
  port: redisURL.port,
  pass: redisPASS,
});

// Link the shared redis instance with the app's router
router.linkMem(redisClient.client);

// Create a new session object
const sessionObj = session({
  key: 'sessionid',
  store: redisClient,
  secret: redisSecret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    sameSite: 'strict',
    expires: expiryDate
  },
});

//Trust first proxy (Heroku)
app.set('trust proxy', 1);

app.use(sessionObj);

// Set up view engine
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

// Have the server parse incoming cookies
app.use(cookieParser());

// Check csrf token
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // No csrf token!!
  return false;
});

// Attach routes to the application
router.attach(app);

// Create a server for http traffic
const server = http.createServer(app);

// Attach Socket.io lib to main server
const io = socketLib(server);

// Attach middleware to parse socket cookie as well
io.use(sharedSession(sessionObj, { autoSave: true }));

// Attach custom events to Socket.io lib
socketHandler.init(io);

server.listen(port);
