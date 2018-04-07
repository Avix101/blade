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

  static sortDeck(cardCollection) {
    return cardCollection.sort((cardA, cardB) => cardB.sortValue - cardA.sortValue);
  }
}

module.exports = Game;
