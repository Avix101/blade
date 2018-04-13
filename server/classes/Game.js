const socketHandler = require('./../socketHandler.js');

// This function creates a new array from a given one,
// but obfuscates the contents of the original array if required
const processArray = (array, obfuscate) => {
  if (obfuscate) {
    return array.map(() => undefined);
  }
  return array;
};

// The game class is used to store game specific details and to process user actions
class Game {
  constructor(room, deck) {
    this.room = room;
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
      winner: null,
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

  // This adds a function to the update queue
  // The updateQueue will execute the next function when both players are ready
  queueUpdate(func) {
    if (this.playerReady.player1 && this.playerReady.player2) {
      func();
      this.playerReady.player1 = false;
      this.playerReady.player2 = false;
    } else {
      this.updateQueue.push(func);
    }
  }

  // Proccess a request to change a player's ready status
  readyPlayer(status, ready) {
    this.playerReady[status] = ready;
    // If both players are ready, execute the next function
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

  // Check the ready status of both players
  checkReadyStatus() {
    return this.playerReady.player1 && this.playerReady.player2;
  }

  // Randomly allocate the given number of cards to each player
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

  // Get player 1's cards
  getPlayer1Cards(obfuscate) {
    return processArray(this.player1Cards, obfuscate);
  }

  // Get player 2's cards
  getPlayer2Cards(obfuscate) {
    return processArray(this.player2Cards, obfuscate);
  }

  // Get player 1's deck
  getPlayer1Deck(obfuscate) {
    return processArray(this.player1Deck, obfuscate);
  }

  // Get player 2's deck
  getPlayer2Deck(obfuscate) {
    return processArray(this.player2Deck, obfuscate);
  }

  // Get the current turn owner
  getTurnOwner() {
    return this.gameState.turnOwner;
  }

  // Get the current gamestate
  getGameState() {
    return this.gameState;
  }

  // Clear the fields for both players
  clearFields() {
    this.player1Field = [];
    this.player2Field = [];

    // Reset gamestate
    this.gameState.clearFields = true;
    this.gameState.turnType = 'pickFromDeck';
    this.gameState.turnOwner = null;
    this.allowInput.player1 = true;
    this.allowInput.player2 = true;

    this.gameState.player1Points = Game.calcPoints(this.player1Field);
    this.gameState.player2Points = Game.calcPoints(this.player2Field);

    // If decks are empty, resolve to a tie
    if (this.getPlayer1Deck().length === 0 || this.getPlayer2Deck().length === 0) {
      this.resolveGame('tie');
    }
  }

  // Determine the starting player based on the current scores (After picking from deck)
  pickStartingPlayer() {
    if (this.gameState.player1Points > this.gameState.player2Points) {
      this.gameState.turnOwner = 'player2';
      this.gameState.turnType = 'playCard';
      if (!Game.checkForNonSpecials(this.getPlayer2Cards())) {
        this.resolveGame('player2');
      }
    } else if (this.gameState.player2Points > this.gameState.player1Points) {
      this.gameState.turnOwner = 'player1';
      this.gameState.turnType = 'playCard';
      if (!Game.checkForNonSpecials(this.getPlayer1Cards())) {
        this.resolveGame('player1');
      }
    } else {
      // Points are tied, clear the board and draw again if possible
      this.clearFields();
    }
  }

  // A static function to check a card collection for any non-special cards
  static checkForNonSpecials(cardCollection) {
    for (let i = 0; i < cardCollection.length; i++) {
      const card = cardCollection[i];

      switch (card.ref) {
        case 'bolt':
        case 'mirror':
        case 'blast':
        case 'force':
          break;
        default:
          return true;
      }
    }
    return false;
  }

  // Switch the turn owner, but resolve the game if the player can't play anything
  switchTurnOwner() {
    if (this.gameState.turnOwner === 'player1') {
      this.gameState.turnOwner = 'player2';
      const cardCollection = this.getPlayer2Cards();
      if (cardCollection.length <= 0 || !Game.checkForNonSpecials(cardCollection)) {
        this.resolveGame('player2');
      }
    } else {
      this.gameState.turnOwner = 'player1';
      const cardCollection = this.getPlayer1Cards();
      if (cardCollection.length <= 0 || !Game.checkForNonSpecials(cardCollection)) {
        this.resolveGame('player1');
      }
    }
  }

  // Reset the clear fields flag
  resetClearFlag() {
    this.gameState.clearFields = false;
  }

  // Calculate the number of points accumulated in a card collection
  static calcPoints(cardCollection) {
    let currentPoints = 0;

    for (let i = 0; i < cardCollection.length; i++) {
      const card = cardCollection[i];

      // If a card's value is altered (e.g. bolt) use it's altered value
      if (card.alterValue !== null) {
        currentPoints += card.alterValue;
      } else {
        switch (card.ref) {
          // Forces double the current total (cards played before it)
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

  // Resolve a game and update the players of the ending gamestate
  resolveGame(loser) {
    this.gameState.turnType = 'end';
    this.gameState.turnOwner = null;
    if (loser === 'tie') {
      this.gameState.winner = 'tie';
    } else if (loser === 'player1') {
      this.gameState.winner = 'player2';
    } else {
      this.gameState.winner = 'player1';
    }

    // Save the game result, and update players
    setTimeout(() => {
      this.queueUpdate(() => {
        socketHandler.saveGame(this.room, this.gameState, () => {
          socketHandler.sendGameState(this.room);
          socketHandler.killGame(this.room);
        });
      });
    }, 50);
  }

  // Resolve a game early (in the event of a disconnect)
  resolveEarly(loser, callback) {
    this.resolveGame(loser);

    this.updateQueue = [];

    if (callback) {
      callback();
    }
  }

  // Check the current point status of players (switch turns, resolve the game, or clear the fields)
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
      this.resolveGame(status);
    } else {
      if (this.player1Deck.length <= 0 || this.player2Deck.length <= 0) {
        // Resolve to a tie
        this.resolveGame('tie');
      }

      // Points are tied - start again
      this.clearFields();
    }
  }

  // Process a turn request from a player
  processTurn(status, index, blastIndex, callback) {
    if (this.gameState.turnType !== 'playCard') {
      return false;
    }

    const playerHand = status === 'player1' ? this.getPlayer1Cards() : this.getPlayer2Cards();
    const opponentHand = status === 'player1' ? this.getPlayer2Cards() : this.getPlayer1Cards();
    const playerField = status === 'player1' ? this.player1Field : this.player2Field;
    const opponentField = status === 'player1' ? this.player2Field : this.player1Field;
    const card = playerHand[index];

    // Depending on the type of card, complete an action
    switch (card.ref) {
      // Special cards affect the game in different ways
      case 'bolt': {
        const affectedCard = opponentField[opponentField.length - 1];
        affectedCard.alterValue = 0;
        break;
      }
      case 'mirror': {
        const temp = opponentField;
        if (status === 'player1') {
          this.player2Field = this.player1Field;
          this.player1Field = temp;
        } else {
          this.player1Field = this.player2Field;
          this.player2Field = temp;
        }
        break;
      }
      // This is the most meddlesome card - seems to cause odd bugs
      case 'blast': {
        opponentHand.splice(blastIndex, 1);
        break;
      }
      case '1': {
        const affectedCard = playerField[playerField.length - 1];
        if (affectedCard.alterValue !== null) {
          if (affectedCard.ref === 'force' && playerField.length === 1) {
            affectedCard.alterValue = 1;
          } else {
            affectedCard.alterValue = null;
          }
        } else {
          playerField.push(card);
        }
        break;
      }
      default: {
        playerField.push(card);
        break;
      }
    }

    // Remove the played card from the player's hand
    playerHand.splice(index, 1);

    // If the card played wasn't a blast, calculate points and check turn status
    if (card.ref !== 'blast') {
      this.gameState.player1Points = Game.calcPoints(this.player1Field);
      this.gameState.player2Points = Game.calcPoints(this.player2Field);

      this.checkPoints(status);
    }

    // Update the caller with the waiting status
    const waiting = !this.checkReadyStatus();

    // Queue an update to process the callback and an update to send the gamestate
    this.queueUpdate(() => {
      callback();
    });

    this.queueUpdate(() => {
      socketHandler.sendGameState(this.room, () => {
        this.resetClearFlag();
      });
    });

    return waiting;
  }

  // Process a client request to pick from their deck
  pickFromDeck(status, callback) {
    if (this.gameState.turnType !== 'pickFromDeck') {
      return false;
    }

    const playerDeck = status === 'player1' ? this.getPlayer1Deck() : this.getPlayer2Deck();
    const playerField = status === 'player1' ? this.player1Field : this.player2Field;

    // Determine if they are allowed to input
    // Each player is allowed to draw once during this phase
    if (!this.allowInput[status]) {
      return false;
    }

    this.allowInput[status] = false;

    const index = playerDeck.length - 1;
    const card = playerDeck[index];

    // If the picked card is a force, its value is 1
    if (card.ref === 'force') {
      card.alterValue = 1;
    }

    // Add the card to the field and process updates to the gamestate
    playerField.push(card);
    playerDeck.splice(index, 1);

    this.gameState.player1Points = Game.calcPoints(this.player1Field);
    this.gameState.player2Points = Game.calcPoints(this.player2Field);

    if (!this.allowInput.player1 && !this.allowInput.player2) {
      this.pickStartingPlayer();
    }

    const waiting = !this.checkReadyStatus();

    // Queue updates to the clients
    this.queueUpdate(() => {
      callback(card);
    });

    this.queueUpdate(() => {
      socketHandler.sendGameState(this.room, () => {
        this.resetClearFlag();
      });
    });

    return waiting;
  }

  // A static function that sorts a given card collection based on each card's sort value
  static sortDeck(cardCollection) {
    const sortedArray = cardCollection.sort((cardA, cardB) => cardB.sortValue - cardA.sortValue);
    sortedArray.reverse();
    return sortedArray;
  }
}

module.exports = Game;
