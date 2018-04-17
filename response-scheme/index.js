const GeoPoint = require('geopoint')

const models = require('../models')
const { PLACEHOLDER_PROFILE_URL } = require('../config/constants')

function getResponse (model, req) {
  let states = model.get()
  let result = {}
  if (model instanceof models.User) {
    result = Object.assign(result, {
      id: states.id,
      firstname: states.firstname,
      lastname: states.lastname,
      email: states.email
    })
    if (model.CurrentProfilePhoto !== undefined) {
      result = Object.assign(result, {
        picture: model.CurrentProfilePhoto === null ? PLACEHOLDER_PROFILE_URL : getResponse(model.CurrentProfilePhoto, req).thumbnail_link
      })
    }
  } else if (model instanceof models.Photo) {
    let links = model.getUrls()
    result = Object.assign(result, {
      id: states.id,
      name: states.name,
      number_of_likes: states.number_of_likes,
      thumbnail_link: links.thumbnail,
      picture_link: links.resized,
      original_url: links.original
    })

    if (model.Owner !== undefined) {
      result = Object.assign(result, {
        is_owner: states.owner_id === req.user.id,
        owner: getResponse(model.Owner, req)
      })
    }

    if (model.LocationTag !== undefined && model.LocationTag !== null) {
      result = Object.assign(result, {
        location: getResponse(model.LocationTag, req)
      })
    }
  } else if (model instanceof models.LocationTag) {
    result = Object.assign(result, {
      id: states.id,
      name: states.name,
      latitude: states.lat,
      longitude: states.long
    })

    if (req.location instanceof GeoPoint) {
      let photoLocation = new GeoPoint(states.lat, states.long)
      let distance = photoLocation.distanceTo(req.location, true)
      result = Object.assign(result, {
        distance,
        is_near: distance <= 2
      })
    }
  }

  return result
}

module.exports = getResponse
