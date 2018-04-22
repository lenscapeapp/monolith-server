const GeoPoint = require('geopoint')
const moment = require('moment')

const GooglePlace = require('../models/data-objects/goopleplace')
const models = require('../models')
const { PLACEHOLDER_PROFILE_URL, IS_NEAR_DISTANCE } = require('../config/constants')

function getResponse (model, req) {
  let result = {}
  if (model instanceof models.User) {
    result = Object.assign(result, {
      id: model.id,
      firstname: model.firstname,
      lastname: model.lastname,
      email: model.email
    })
    if (model.CurrentProfilePhoto !== undefined) {
      result = Object.assign(result, {
        picture: model.CurrentProfilePhoto === null ? PLACEHOLDER_PROFILE_URL : getResponse(model.CurrentProfilePhoto, req).thumbnail_link
      })
    }
  } else if (model instanceof models.Photo) {
    let links = model.getUrls()
    result = Object.assign(result, {
      id: model.id,
      name: model.name,
      number_of_likes: model.number_of_likes,
      thumbnail_link: links.thumbnail,
      picture_link: links.resized,
      original_url: links.original,
      timestamp: model.createdAt.getTime(),
      date_taken: model.date_taken && model.date_taken.getTime(),
      timestamp_string: moment(model.createdAt).format('D MMMM YYYY'),
      date_taken_string: moment(model.date_taken).format('D MMMM YYYY')
    })

    if (model.Owner !== undefined) {
      result = Object.assign(result, {
        is_owner: model.owner_id === req.user.id,
        owner: getResponse(model.Owner, req)
      })
    }

    if (model.LocationTag !== undefined && model.LocationTag !== null) {
      result = Object.assign(result, {
        location: getResponse(model.LocationTag, req)
      })
    }

    if (model.LikedUsers) {
      result = Object.assign(result, {
        is_liked: model.LikedUsers.some(user => user.id === req.user.id)
      })
    }
  } else if (model instanceof models.LocationTag) {
    result = Object.assign(result, {
      id: model.id,
      name: model.name,
      address: model.address,
      latitude: model.lat,
      longitude: model.long,
      is_google_place: false
    })

    if (req.location instanceof GeoPoint) {
      let photoLocation = new GeoPoint(model.lat, model.long)
      let distance = photoLocation.distanceTo(req.location, true)
      result = Object.assign(result, {
        distance,
        is_near: distance <= IS_NEAR_DISTANCE
      })
    }
  } else if (model instanceof GooglePlace) {
    result = Object.assign(result, {
      id: model.gplace_id,
      name: model.name,
      address: model.address,
      latitude: model.location.latitude(),
      longitude: model.location.longitude(),
      is_google_place: true
    })

    if (req.location instanceof GeoPoint) {
      let distance = req.location.distanceTo(model.location, true)
      result = Object.assign(result, {
        distance,
        is_near: distance <= IS_NEAR_DISTANCE
      })
    }
  }

  return result
}

module.exports = getResponse
