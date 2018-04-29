const GeoPoint = require('geopoint')

const gmap = require('../functions/gmap')
const GooglePlace = require('../models/data-objects/goopleplace')
const { LocationTag, Photo, sequelize } = require('../models')

const METERS = 1000
const Op = sequelize.Op

module.exports = {

  async aroundme (req, res, next) {
    let { radius, search, latlong } = req.data
    let location = new GeoPoint(...(latlong.split(',').map(Number)))
    let [swBound, neBound] = location.boundingCoordinates(radius, 0, true)

    let gplaces, lplaces
    if (search) {
      [gplaces, lplaces] = await Promise.all([
        gmap.placesAutoComplete({ input: search, location: latlong, radius: radius * METERS, language: 'en' }).asPromise(),
        LocationTag.findAll({ where: { name: { [Op.iLike]: `%${search}%` } }, order: [['name']] })
      ])
      if (gplaces.json.status === 'OK') {
        gplaces = await Promise.all(gplaces.json.predictions.map(prediction => gmap.place({ placeid: prediction.place_id }).asPromise()))
        gplaces = gplaces.map(gplace => gplace.json.result)
      } else {
        gplaces = gplaces.json.predictions
      }
      lplaces.sort((a, b) => {
        let query = req.data.search.toLowerCase()
        return a.name.toLowerCase().indexOf(query) - b.name.toLowerCase().indexOf(query)
      })
    } else {
      [gplaces, lplaces] = await Promise.all([
        gmap.placesNearby({ location: latlong, radius: radius * METERS, language: 'en' }).asPromise(),
        LocationTag.findAll({
          where: {
            lat: { [Op.between]: [swBound.latitude(), neBound.latitude()] },
            long: { [Op.between]: [swBound.longitude(), neBound.longitude()] }
          }
        })
      ])
      gplaces = await Promise.all(
        gplaces.json.results.map(async gplace => {
          let result = await gmap.reverseGeocode({place_id: gplace.place_id, language: 'en'}).asPromise()
          return Object.assign(gplace, result.json.results[0])
        })
      )
    }

    gplaces = gplaces.filter(gplace => (lplaces.every(lplace => (!lplace.gplace_id) || (lplace.gplace_id !== gplace.place_id)))).map(gplace => new GooglePlace(gplace))
    res.states.data = lplaces.concat(gplaces)
    next()
  },

  async listLocation (req, res, next) {
    let {rows: locations} = await LocationTag.findAndCount({
      where: {
        name: {
          [Op.iLike]: `%${req.data.input}%`
        }
      }
    })

    locations.sort((a, b) => {
      let query = req.data.input.toLowerCase()
      return a.name.toLowerCase().indexOf(query) - b.name.toLowerCase().indexOf(query)
    })

    res.states = {
      data: locations
    }

    next()
  },

  async getLocation (req, res, next) {
    let {location_id: locationId} = req.data
    let location = await LocationTag.findById(locationId)

    res.states.data = location
    next()
  },

  async listLocationPhoto (req, res, next) {
    let { page, size, startId, location_id: locationId, is_owner: isOwner } = req.data

    let whereClause = {
      locationtag_id: locationId,
      id: {
        [Op.lte]: startId
      },
      owner_id: isOwner ? req.user.id : { [Op.ne]: null }
    }
    let [count, rows] = await Promise.all([
      Photo.scope(null).count({ where: whereClause }),
      Photo.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: size,
        offset: size * (page - 1)
      })
    ])
    res.states.data = rows
    res.states.count = count
    res.states.page = page
    res.states.size = size
    next()
  }
}
