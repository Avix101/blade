const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;

// Construct a new schema for accounts
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,32}$/,
  },
  reddit_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  salt: {
    type: Buffer,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile_name: {
    type: String,
    required: true,
  },
  privacy: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Add a function to convert a doc to an account object
AccountSchema.statics.toAPI = doc => ({
  username: doc.username,
  profile_name: doc.profile_name,
  privacy: doc.privacy,
  _id: doc._id,
});

// Validate a user's password
const validatePassword = (doc, password, callback) => {
  const pass = doc.password;

  return crypto.pbkdf2(password, doc.salt, iterations, keyLength, 'RSA-SHA512', (err, hash) => {
    if (hash.toString('hex') !== pass) {
      return callback(false);
    }
    return callback(true);
  });
};

// Find an account by username
AccountSchema.statics.findByUsername = (name, callback) => {
  const search = {
    username: name,
  };

  return AccountModel.findOne(search, callback);
};

// Find an account by the user's reddit id
AccountSchema.statics.findByRedditId = (id, callback) => {
  const search = {
    reddit_id: id,
  };

  return AccountModel.findOne(search, callback);
};

// Find an account by Id
AccountSchema.statics.findById = (id, callback) => {
  const search = {
    _id: id,
  };

  return AccountModel.findOne(search, callback);
};

// Find multiple accounts given an array of Ids
AccountSchema.statics.findByIdMultiple = (ids, callback) => {
  const search = {
    _id: { $in: ids },
  };

  return AccountModel.find(search, callback);
};

// Generate a new hash and salt for a password
AccountSchema.statics.generateHash = (password, callback) => {
  const salt = crypto.randomBytes(saltLength);

  crypto.pbkdf2(password, salt, iterations, keyLength, 'RSA-SHA512', (err, hash) =>
    callback(salt, hash.toString('hex')));
};

// Authenticate a user
AccountSchema.statics.authenticate = (username, password, callback) =>
  AccountModel.findByUsername(username, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback();
    }

    return validatePassword(doc, password, (result) => {
      if (result === true) {
        return callback(null, doc);
      }

      return callback();
    });
  });

AccountModel = mongoose.model('Account', AccountSchema);

module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;
