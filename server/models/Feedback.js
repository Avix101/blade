const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let FeedbackModel = {};

// Construct a feedback schema
const FeedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  contact: {
    type: String,
  },
  feedback: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Turn the schema into a model
FeedbackModel = mongoose.model('Feedback', FeedbackSchema);

module.exports.FeedbackModel = FeedbackModel;
module.exports.FeedbackSchema = FeedbackSchema;
