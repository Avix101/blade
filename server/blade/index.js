const deckTemplate = require('./deckTemplate.js');

const classes = require('./../classes');

const { Card } = classes;
const { Game } = classes;

const games = {};

// Functions to check if a game exists and get an existing game
const gameExists = roomId => games[roomId] !== undefined;
const getGame = roomId => games[roomId];

// Each player starts with 10 cards
const numCardsPerPlayer = 10;

// Depending on the reqeusted deck type, compile an object of decks
const getDeck = (roomId, deckType) => {
  const game = getGame(roomId);

  // All decks should be obscured except for the player's deck
  // (The player only knows their own cards)
  const deck = {
    player1: game.getPlayer1Cards(true),
    player2: game.getPlayer2Cards(true),
    p1Deck: game.getPlayer1Deck(true),
    p2Deck: game.getPlayer2Deck(true),
  };

  switch (deckType) {
    case 'player1':
      deck.player1 = game.getPlayer1Cards(false);
      break;
    case 'player2':
      deck.player2 = game.getPlayer2Cards(false);
      break;
    default:
      break;
  }

  return deck;
};

// Get a game's current state and return it
const getGameState = (roomId) => {
  if (gameExists(roomId)) {
    const game = getGame(roomId);
    return game.getGameState();
  }

  return null;
};

// Get a single card set instead of a whole deck (don't obscure)
const getSingleCardSet = (roomId, type) => {
  const game = getGame(roomId);
  switch (type) {
    case 'player1':
      return game.getPlayer1Cards(false);
    case 'player2':
      return game.getPlayer2Cards(false);
    default:
      return [];
  }
};

// Sort a given deck so that all of the cards are in proper order
const sortDeck = (roomId, deckType, callback) => {
  const game = getGame(roomId);
  switch (deckType) {
    case 'player1':
      Game.sortDeck(game.getPlayer1Cards(false));
      break;
    case 'player2':
      Game.sortDeck(game.getPlayer2Cards(false));
      break;
    default:
      break;
  }

  if (callback) {
    callback();
  }
};

// Get all possible card images and send them to the client
const getCardImages = () => {
  const cardImages = [];
  const cardKeys = Object.keys(deckTemplate);
  for (let i = 0; i < cardKeys.length; i++) {
    const card = deckTemplate[cardKeys[i]];
    cardImages.push({ name: card.name, src: card.imageFile });
  }

  return cardImages;
};

// Start a game by constructing a new deck and setting up a new game object
const beginGame = (roomId, callback) => {
  const deck = [];

  // Using the card templates, make a new deck
  const cardKeys = Object.keys(deckTemplate);
  for (let i = 0; i < cardKeys.length; i++) {
    const cardInfo = deckTemplate[cardKeys[i]];
    for (let j = 0; j < cardInfo.amount; j++) {
      const card = new Card(cardInfo);
      deck.push(card);
    }
  }

  games[roomId] = new Game(roomId, deck);
  const game = getGame(roomId);
  game.allocateCards(numCardsPerPlayer);

  callback();
};

// Validate that a card exists in a players hand
const validateCard = (roomId, status, index) => {
  const deck = getSingleCardSet(roomId, status);
  if (index >= 0 && index < deck.length) {
    return true;
  }

  return false;
};

// Pick the top card from a player's deck
const pickFromDeck = (roomId, status, callback) => {
  const game = getGame(roomId);
  return game.pickFromDeck(status, callback);
};

// Play a card from a player's hand
const playCard = (roomId, status, index, blastIndex, callback) => {
  const game = getGame(roomId);
  const deck = getSingleCardSet(roomId, status);
  const card = deck[index];

  if (game.getTurnOwner() !== status) {
    return false;
  }

  // Validate the provided blast index, if necessary
  let blast = blastIndex;
  const opponentStatus = status === 'player1' ? 'player2' : 'player1';
  if (!blast || !validateCard(roomId, opponentStatus, blast)) {
    blast = 0;
  }

  return game.processTurn(status, index, blast, () => {
    callback(status, card.ref, blast);
  });
};

// In the event of a player disconnect, resolve the game early
const resolveDisconnect = (roomId, status, callback) => {
  const game = getGame(roomId);
  game.resolveEarly(status, callback);
};

// Kill a game on request
const killGame = (roomId) => {
  delete games[roomId];
};

// Process a client reqeust to change their ready status
const playerReady = (roomId, status, ready) => {
  if (status !== 'player1' && status !== 'player2') {
    return;
  }

  const game = getGame(roomId);
  game.readyPlayer(status, ready);
};

module.exports = {
  getCardImages,
  beginGame,
  gameExists,
  getGameState,
  getGame,
  getDeck,
  sortDeck,
  validateCard,
  pickFromDeck,
  playCard,
  playerReady,
  resolveDisconnect,
  killGame,
};
