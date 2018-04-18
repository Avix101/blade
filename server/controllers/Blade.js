const mongoose = require('mongoose');
const models = require('./../models');
const profilePics = require('./profiles.js');

const { Feedback } = models;
const { GameResult } = models;
const { Account } = models;

// Render the main page, pass in useful data to the template engine
const main = (req, res) => {
  const profileData = profilePics[req.session.account.profile_name];
  const { username } = req.session.account;
  res.render('blade', { profileData, username });
};

// Get a players profile image
const getProfile = (request, response) => {
  const req = request;
  const res = response;

  req.query.profile = `${req.query.profile}`;

  if (!req.query.profile) {
    res.status(400).json({ error: 'Bad profile request' });
  }

  const profile = profilePics[req.query.profile];
  res.status(200).json({ imageFile: profile.imageFile });
};

// Get all possible profile images
const getAllProfilePics = (req, res) => {
  if (Object.keys(profilePics).length <= 0) {
    return res.status(500).json({ error: 'Profile pics not loaded by server' });
  }

  return res.json({ profilePics });
};

// Submit feedback from the client about the site
const submitFeedback = (request, response) => {
  const req = request;
  const res = response;

  req.body.name = `${req.body.name}`;
  req.body.contact = `${req.body.contact}`;
  req.body.feedback = `${req.body.feedback}`;

  if (!req.body.name || !req.body.feedback) {
    res.status(400).json({ error: 'Name and feedback fields are required!' });
  }

  const feedbackData = {
    name: req.body.name,
    contact: req.body.contact,
    feedback: req.body.feedback,
  };

  const newFeedback = new Feedback.FeedbackModel(feedbackData);

  const savePromise = newFeedback.save();

  savePromise.then(() => {
    res.status(201).json({ message: 'Feedback successfully saved!' });
  });

  savePromise.catch(() => {
    res.status(500).json({ error: 'Feedback could not be saved' });
  });
};

// Bundle player data in a payload that is acceptable to send across the network (security)
const bundlePlayerData = account => ({
  username: account.username,
  profileData: profilePics[account.profile_name],
});

// Get all relevant game results that a player was part of
const getGameHistory = (req, res) => {
  const id = req.session.account._id;

  return GameResult.GameResultModel.findAllGamesFor(id, (err, games) => {
    if (err) {
      res.status(500).json({ error: 'Game history could not be retrieved.' });
    }

    const accounts = {};
    const accountIds = [];

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (!accounts[game.player1Id]) {
        accounts[game.player1Id] = {};
        accountIds.push(mongoose.Types.ObjectId(game.player1Id));
      }
      if (!accounts[game.player2Id]) {
        accounts[game.player2Id] = {};
        accountIds.push(mongoose.Types.ObjectId(game.player2Id));
      }
    }

    // Find all relevant account ids
    return Account.AccountModel.findByIdMultiple(accountIds, (err2, results) => {
      if (err2) {
        res.status(500).json({ error: 'Game history could not be retrieved.' });
      }

      for (let i = 0; i < results.length; i++) {
        const account = results[i];
        accounts[account._id] = bundlePlayerData(account);
      }

      // Generate and send game data to the requester
      const data = [];
      for (let i = 0; i < games.length; i++) {
        const game = games[i];

        const playerIdentity = id.toString() === game.player1Id.toString() ? 'player1' : 'player2';

        const gameData = {
          id: game._id,
          winner: game.winner,
          player1: accounts[game.player1Id],
          player2: accounts[game.player2Id],
          player1Score: game.player1Score,
          player2Score: game.player2Score,
          playerIdentity,
          date: game.createdDate,
        };

        data.push(gameData);
      }

      res.status(200).json({ data });
    });
  });
};

module.exports = {
  main,
  getProfile,
  getAllProfilePics,
  submitFeedback,
  getGameHistory,
};
