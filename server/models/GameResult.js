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
  player1Privacy: {
    type: Boolean,
    required: true,
  },
  player2Privacy: {
    type: Boolean,
    required: true,
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

// A static function that searches for a given number of games that fit the search criteria
GameResultSchema.statics.searchForGames = (id, startDate, endDate, limit, callback) => {
  const search = {};

  // Include an id to search for if requested
  if (id) {
    search.$or = [
      { player1Id: id },
      { player2Id: id },
    ];
  }

  // Include a start and end date if specified
  if (startDate && endDate) {
    search.createdDate = {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString(),
    };
  }

  // Return public games only
  search.player1Privacy = false;
  search.player2Privacy = false;

  GameResultModel.find(search, callback).sort({ createdDate: -1 }).limit(limit);
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
