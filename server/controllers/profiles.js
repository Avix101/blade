const fs = require('fs');

const imageDir = '/hosted/img/player_icons/';
const imageLink = '/assets/img/player_icons/';
const profilePicStruct = {};

// Dynamically collect all images within a hosted folder and store their names and links
fs.readdir(`${__dirname}/../../${imageDir}`, (err, files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageFile = `${imageLink}${file}`;
    const [key] = file.split('.');
    const name = key.charAt(0).toUpperCase() + key.slice(1);

    profilePicStruct[key] = {
      name,
      imageFile,
    };
  }
});

module.exports = profilePicStruct;
