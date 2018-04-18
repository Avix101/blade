const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let GameResultModel = {};

// Construct a game results schema (stores ids and scores)
const GameResultSchema = new mongoose.Schema({
  player1Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  player2Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  winner: {
    type: String,
    required: true,
  },
  player1Score: {
    type: Number,
    set: num => Math.floor(num),
    min: 0,
    max: 1000,
  },
  player2Score: {
    type: Number,
    set: num => Math.floor(num),
    min: 0,
    max: 1000,
  },
  meta: {
    type: Object,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// A static function that finds all games that a player (account) was involved in
GameResultSchema.statics.findAllGamesFor = (id, callback) => {
  const search = {
    $or: [
      { player1Id: id },
      { player2Id: id },
    ],
  };

  GameResultModel.find(search, callback);
};

// A static function that searches for a GameResult by its id
GameResultSchema.statics.findById = (id, callback) => {
  const search = {
    _id: id,
  };

  return GameResultModel.findOne(search, callback);
};

GameResultModel = mongoose.model('GameResult', GameResultSchema);

module.exports.GameResultModel = GameResultModel;
module.exports.GameResultSchema = GameResultSchema;
