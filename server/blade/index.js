const deckTemplate = require('./deckTemplate.js');

const classes = require('./../classes');

const { Card } = classes;
const { Game } = classes;

const games = {};
const gameExists = roomId => games[roomId] !== undefined;
const getGame = roomId => games[roomId];

const numCardsPerPlayer = 10;

const getDeck = (roomId, deckType) => {
  const game = getGame(roomId);
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

const getCardImages = () => {
  const cardImages = [];
  const cardKeys = Object.keys(deckTemplate);
  for (let i = 0; i < cardKeys.length; i++) {
    const card = deckTemplate[cardKeys[i]];
    cardImages.push({ name: card.name, src: card.imageFile });
  }

  return cardImages;
};

const beginGame = (roomId, callback) => {
  const deck = [];

  const cardKeys = Object.keys(deckTemplate);
  for (let i = 0; i < cardKeys.length; i++) {
    const cardInfo = deckTemplate[cardKeys[i]];
    for (let j = 0; j < cardInfo.amount; j++) {
      const card = new Card(cardInfo);
      deck.push(card);
    }
  }

  games[roomId] = new Game(deck);
  const game = getGame(roomId);
  game.allocateCards(numCardsPerPlayer);

  callback();
};

const validateCard = (roomId, status, index) => {
  const deck = getSingleCardSet(roomId, status);
  if (index >= 0 && index < deck.length) {
    return true;
  }
  return false;
};

const playCard = (roomId, status, index, callback) => {
  const game = getGame(roomId);
  const deck = getSingleCardSet(roomId, status);
  const card = deck[index];
  game.player1Field.push(card);
  deck.splice(index, 1);
  callback(status);
};

module.exports = {
  getCardImages,
  beginGame,
  gameExists,
  getGame,
  getDeck,
  sortDeck,
  validateCard,
  playCard,
};