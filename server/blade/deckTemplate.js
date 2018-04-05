const cardDir = "/assets/img/cards/";
const deckTemplate = {
  "back": {
    name: "back",
    value: 0,
    amount: 0,
    imageFile: `${cardDir}00 Back.png`,
  },
  "1": {
    name: "1",
    value: 1,
    amount: 2,
    imageFile: `${cardDir}02x Wand.png`,
  },
  "2": {
    name: "2",
    value: 2,
    amount: 3,
    imageFile: `${cardDir}03x Blade Pistols.png`,
  },
  "3": {
    name: "3",
    value: 3,
    amount: 4,
    imageFile: `${cardDir}04x Bow.png`,
  },
  "4": {
    name: "4",
    value: 4,
    amount: 4,
    imageFile: `${cardDir}04x Sword.png`,
  },
  "5": {
    name: "5",
    value: 5,
    amount: 4,
    imageFile: `${cardDir}04x Shotgun.png`,
  },
  "6": {
    name: "6",
    value: 6,
    amount: 3,
    imageFile: `${cardDir}03x Spear.png`,
  },
  "7": {
    name: "7",
    value: 7,
    amount: 2,
    imageFile: `${cardDir}02x Broadsword.png`,
  },
  "bolt": {
    name: "bolt",
    value: 1,
    amount: 6,
    imageFile: `${cardDir}06x Bolt.png`,
  },
  "mirror": {
    name: "mirror",
    value: 1,
    amount: 4,
    imageFile: `${cardDir}04x Mirror.png`,
  },
  "blast": {
    name: "blast",
    value: 1,
    amount: 2,
    imageFile: `${cardDir}02x Blast.png`,
  },
  "force": {
    name: "force",
    value: 1,
    amount: 2,
    imageFile: `${cardDir}02x Force.png`,
  }
};

module.exports = deckTemplate;