class Card {
  constructor(template) {
    this.value = template.value;
    this.ref = template.name;
    this.imageFile = template.imageFile;
  }
}

module.exports = Card;
