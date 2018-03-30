const GeoPoint = require('geopoint')

const userScheme = require('./user')

class PhotoResponse {
  constructor (photo) {
    this.photo = photo

    this.response = {
      id: photo.id,
      name: photo.name,
      number_of_like: 0,
      thumbnail_link: photo.getUrls().thumbnail,
      picture_link: photo.getUrls().resized,
      original_link: photo.getUrls().original,
      location: {
        name: photo.LocationTag.name,
        latitude: photo.LocationTag.lat,
        longitude: photo.LocationTag.long
      }
    }

    if (photo.Owner) {
      this.response.Owner = userScheme(photo.Owner)
    }
  }

  calculateLocation (current) {
    if (!current) { return this }
    if (!this.response.location) { return this }

    let photoPoint = new GeoPoint(this.photo.LocationTag.lat, this.photo.LocationTag.long)
    this.response.location.distance = Math.ceil(current.distanceTo(photoPoint, true) * 1000) / 1000
    this.response.location.is_near = this.response.location.distance <= 2

    return this
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

module.exports = (photo, user, currentLocation) =>
  new PhotoResponse(photo)
    .checkUser(user)
    .calculateLocation(currentLocation)
    .getResponse()
