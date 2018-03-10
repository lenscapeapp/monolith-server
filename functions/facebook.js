const { Facebook, FacebookApiException } = require('fb')

async function getProfile (accessToken) {
  let fb = new Facebook({ version: 'v2.12' })
  fb.setAccessToken(accessToken)

  let profile = null
  try {
    profile = await fb.api('me', {
      fields: ['id', 'first_name', 'last_name', 'email', 'picture.type(large)']
    })
  } catch (error) {
    throw error
  }
  return profile
}

module.exports = {
  getProfile
}
