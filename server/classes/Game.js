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
    this.updateQueue = [];
    this.playerReady = {
      player1: false,
      player2: false,
    };
    this.gameState = {
      turnType: 'pickFromDeck',
      turnOwner: null,
      player1Points: 0,
      player2Points: 0,
      clearFields: false,
    };
    this.allowInput = {
      player1: true,
      player2: true,
    };
  }

  queueUpdate(func) {
    if (this.playerReady.player1 && this.playerReady.player2) {
      func();
      this.playerReady.player1 = false;
      this.playerReady.player2 = false;
    } else {
      this.updateQueue.push(func);
    }
  }

  readyPlayer(status, ready) {
    this.playerReady[status] = ready;
    if (this.playerReady.player1 && this.playerReady.player2) {
      if (this.updateQueue.length > 0) {
        const func = this.updateQueue[0];
        func();
        this.playerReady.player1 = false;
        this.playerReady.player2 = false;
        this.updateQueue.splice(0, 1);
      }
    }
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

  clearFields() {
    this.player1Field = [];
    this.player2Field = [];

    this.gameState.clearFields = true;
    this.gameState.turnType = 'pickFromDeck';
    this.gameState.turnOwner = null;
    this.allowInput.player1 = true;
    this.allowInput.player2 = true;

    this.gameState.player1Points = Game.calcPoints(this.player1Field);
    this.gameState.player2Points = Game.calcPoints(this.player2Field);
  }

  pickStartingPlayer() {
    if (this.gameState.player1Points > this.gameState.player2Points) {
      this.gameState.turnOwner = 'player2';
      this.gameState.turnType = 'playCard';
    } else if (this.gameState.player2Points > this.gameState.player1Points) {
      this.gameState.turnOwner = 'player1';
      this.gameState.turnType = 'playCard';
    } else {
      // Points are tied, clear the board and draw again if possible
      this.clearFields();
    }
  }

  switchTurnOwner() {
    if (this.gameState.turnOwner === 'player1') {
      this.gameState.turnOwner = 'player2';
    } else {
      this.gameState.turnOwner = 'player1';
    }
  }

  resetClearFlag() {
    this.gameState.clearFields = false;
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

  checkPoints(status) {
    const playerPoints = status === 'player1' ?
      this.gameState.player1Points :
      this.gameState.player2Points;

    const opponentPoints = status === 'player1' ?
      this.gameState.player2Points :
      this.gameState.player1Points;

    if (playerPoints > opponentPoints) {
      this.switchTurnOwner();
    } else if (playerPoints < opponentPoints) {
      // Resolve win / loss
    } else {
      if (this.player1Deck.length <= 0 || this.player2Deck.length <= 0) {
        // Resolve to a tie
      }

      // Points are tied - start again
      this.clearFields();
    }
  }

  processTurn(status, index, callback) {
    const playerHand = status === 'player1' ? this.getPlayer1Cards() : this.getPlayer2Cards();
    const playerField = status === 'player1' ? this.player1Field : this.player2Field;
    const card = playerHand[index];
    playerField.push(card);
    playerHand.splice(index, 1);

    this.gameState.player1Points = Game.calcPoints(this.player1Field);
    this.gameState.player2Points = Game.calcPoints(this.player2Field);

    this.checkPoints(status);

    this.queueUpdate(() => {
      callback();
      this.resetClearFlag();
    });
  }

  pickFromDeck(status, callback) {
    if (this.gameState.turnType !== 'pickFromDeck') {
      return;
    }

    const playerDeck = status === 'player1' ? this.getPlayer1Deck() : this.getPlayer2Deck();
    const playerField = status === 'player1' ? this.player1Field : this.player2Field;

    if (!this.allowInput[status]) {
      return;
    }

    this.allowInput[status] = false;

    const index = playerDeck.length - 1;
    const card = playerDeck[index];

    if (card.ref === 'force') {
      card.alterValue = 1;
    }

    playerField.push(card);
    playerDeck.splice(index, 1);

    this.gameState.player1Points = Game.calcPoints(this.player1Field);
    this.gameState.player2Points = Game.calcPoints(this.player2Field);

    if (!this.allowInput.player1 && !this.allowInput.player2) {
      this.pickStartingPlayer();
    }

    this.queueUpdate(() => {
      callback(card);
      this.resetClearFlag();
    });
  }

  static sortDeck(cardCollection) {
    const sortedArray = cardCollection.sort((cardA, cardB) => cardB.sortValue - cardA.sortValue);
    sortedArray.reverse();
    return sortedArray;
  }
}

module.exports = Game;
