const userScheme = require('./user')

class PhotoResponse {
  constructor (photo) {
    this.photo = photo

    this.response = {
      id: photo.id,
      name: '', // photo.get('name')
      number_of_like: 0,
      thumbnail_link: photo.getUrls().thumbnail,
      picture_link: photo.getUrls().resized,
      original_link: photo.getUrls().original,
      location: {
        name: '',
        latitude: photo.lat,
        longitude: photo.long,
        is_near: true,
        distance: 2.0
      }
    }

    if (photo.owner) {
      this.response.owner = userScheme(photo.owner)
    }
  }

  checkUser (user) {
    if (!user) return this

    this.response.is_owner = user.id === this.photo.owner_id

    return this
  }

  getResponse () {
    return this.response
  }
}

module.exports = (photo, user) =>
  new PhotoResponse(photo)
    .checkUser(user)
    .getResponse()
