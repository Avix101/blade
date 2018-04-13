// All card objects have a value, sort value, name, image file, and potentially an altered value
// (for effect cards)
class Card {
  constructor(template) {
    this.value = template.value;
    this.sortValue = template.sortValue;
    this.ref = template.name;
    this.imageFile = template.imageFile;
    this.alterValue = null;
  }

  // Alters the value of a card temporarily
  alterValue(value) {
    this.alterValue = value;
  }
}

module.exports = Card;
