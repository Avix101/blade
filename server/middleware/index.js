// Requires a request to be authenticated
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }

  return next();
};

// Requires a real account login, not the guest account
const requiresNonGuestLogin = (req, res, next) => {
  if (!req.session.account || req.session.account._id.toString() === process.env.GUEST_KEY) {
    return res.status(400).json({ error: 'This function is reserved for members only' });
  }

  return next();
};

// Requires a request to be inauthenticated
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/blade');
  }

  return next();
};

// Requires a request to be secure
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }

  return next();
};

// Allows a request to bypass the secure layer
const bypassSecure = (req, res, next) => {
  next();
};

// Redirects the user in the event of a 404
const notFound = (req, res) => {
  res.redirect('/');
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresNonGuestLogin = requiresNonGuestLogin;
module.exports.requiresLogout = requiresLogout;
module.exports.notFound = notFound;

// Exports the secure middleware based on node environment (production, development, etc.)
if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
