const deckTemplate = require('./deckTemplate.js');

const classes = require('./../classes');

const { Card } = classes;
const { Game } = classes;

const games = {};
const gameExists = roomId => games[roomId] !== undefined;
const getGame = roomId => games[roomId];

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
    default:
      break;
  }

  return deck;
};

const numCardsPerPlayer = 10;

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

module.exports = {
  getCardImages,
  beginGame,
  gameExists,
  getGame,
  getDeck,
};
