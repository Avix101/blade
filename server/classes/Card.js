class Card {
  constructor(template) {
    this.value = template.value;
    this.sortValue = template.sortValue;
    this.ref = template.name;
    this.imageFile = template.imageFile;
  }
}

module.exports = Card;
