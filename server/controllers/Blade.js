const profilePics = require('./profiles.js');

// Render the main page
const main = (req, res) => {
  const profileData = profilePics[req.session.account.profile_name];
  const { username } = req.session.account;
  res.render('blade', { profileData, username });
};

const getAllProfilePics = (req, res) => {
  if (Object.keys(profilePics).length <= 0) {
    return res.status(500).json({ error: 'Profile pics not loaded by server' });
  }

  return res.json({ profilePics });
};

module.exports = {
  main,
  getAllProfilePics,
};
