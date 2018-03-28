const { PLACEHOLDER_PROFILE_URL } = require('../config/constants')

module.exports = (user) => ({
  id: user.id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  picture: user.currentProfilePicture ? user.currentProfilePicture.getUrls().thumbnail : PLACEHOLDER_PROFILE_URL
})