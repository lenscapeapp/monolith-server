const request = require('request-promise-native')
const { Facebook, FacebookApiException } = require('fb')

async function getProfile (accessToken) {
  let fb = new Facebook({ version: 'v2.12' })
  fb.setAccessToken(accessToken)

  let profile = null
  profile = await fb.api('me', {
    fields: ['id', 'first_name', 'last_name', 'email', 'picture.width(1200).height(1200)']
  })

  if (!profile.picture.data.is_silhouette) {
    let pictureBuffer = await request.get(profile.picture.data.url, { encoding: null })
    profile.pictureBuffer = pictureBuffer
  }

  return profile
}

module.exports = {
  getProfile
}
