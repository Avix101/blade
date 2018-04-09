const processArray = (array, obfuscate) => {
  if (obfuscate) {
    return array.map(() => undefined);
  }
  return array;
};

class Game {
  constructor(deck) {
    this.deck = deck;
    this.player1Cards = [];
    this.player2Cards = [];
    this.player1Deck = [];
    this.player2Deck = [];
    this.player1Field = [];
    this.player2Field = [];
    this.playersReady = {};
    this.gameState = {
      turnOwner: null,
      player1Points: 0,
      player2Points: 0,
    };
  }

  allocateCards(numPerPlayer) {
    for (let i = 0; i < numPerPlayer; i++) {
      const randIndex1 = Math.floor(Math.random() * this.deck.length);
      const randCard1 = this.deck[randIndex1];
      this.player1Cards.push(randCard1);
      this.deck.splice(randIndex1, 1);

      const randIndex2 = Math.floor(Math.random() * this.deck.length);
      const randCard2 = this.deck[randIndex2];
      this.player2Cards.push(randCard2);
      this.deck.splice(randIndex2, 1);
    }

    const iterationCount = this.deck.length / 2;
    for (let i = 0; i < iterationCount; i++) {
      const randIndex1 = Math.floor(Math.random() * this.deck.length);
      const randCard1 = this.deck[randIndex1];
      this.player1Deck.push(randCard1);
      this.deck.splice(randIndex1, 1);

      const randIndex2 = Math.floor(Math.random() * this.deck.length);
      const randCard2 = this.deck[randIndex2];
      this.player2Deck.push(randCard2);
      this.deck.splice(randIndex2, 1);
    }
  }

  getPlayer1Cards(obfuscate) {
    return processArray(this.player1Cards, obfuscate);
  }

  getPlayer2Cards(obfuscate) {
    return processArray(this.player2Cards, obfuscate);
  }

  getPlayer1Deck(obfuscate) {
    return processArray(this.player1Deck, obfuscate);
  }

  getPlayer2Deck(obfuscate) {
    return processArray(this.player2Deck, obfuscate);
  }

  getTurnOwner() {
    return this.gameState.turnOwner;
  }

  getGameState() {
    return this.gameState;
  }

  pickStartingPlayer() {
    const randomNum = Math.floor(Math.random() * 2);
    this.gameState.turnOwner = randomNum === 0 ? 'player1' : 'player2';
  }

  switchTurnOwner() {
    if (this.gameState.turnOwner === 'player1') {
      this.gameState.turnOwner = 'player2';
    } else {
      this.gameState.turnOwner = 'player1';
    }
  }

  static calcPoints(cardCollection) {
    let currentPoints = 0;

    for (let i = 0; i < cardCollection.length; i++) {
      const card = cardCollection[i];

      if (card.alterValue) {
        currentPoints += card.alterValue;
      } else {
        switch (card.ref) {
          case 'force':
            currentPoints *= 2;
            break;
          default:
            currentPoints += card.value;
            break;
        }
      }
    }

    return currentPoints;
  }

  processTurn(status, index, callback) {
    const playerHand = status === 'player1' ? this.getPlayer1Cards() : this.getPlayer2Cards();
    const playerField = status === 'player1' ? this.player1Field : this.player2Field;
    const card = playerHand[index];
    playerField.push(card);
    playerHand.splice(index, 1);
    this.gameState.player1Points = Game.calcPoints(this.player1Field);
    this.gameState.player2Points = Game.calcPoints(this.player2Field);

    callback();
  }

  static sortDeck(cardCollection) {
    const sortedArray = cardCollection.sort((cardA, cardB) => cardB.sortValue - cardA.sortValue);
    sortedArray.reverse();
    return sortedArray;
  }
}

module.exports = Game;
