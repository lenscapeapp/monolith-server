const GeoPoint = require('geopoint')
const { Router } = require('express')

const { Photo, User, sequelize, LocationTag } = require('../models')
const resScheme = require('../response-scheme')
const Op = sequelize.Op

const router = new Router()

router.get('/aroundme/photos', async (req, res, next) => {
  let [lat, long] = req.query.latlong.split(',').map(Number)
  let userPoint = new GeoPoint(lat, long)
  let [swBound, neBound] = userPoint.boundingCoordinates(5, 0, true)

  try {
    let {count: total, rows: photos} = await Photo.findAndCount({
      where: {
        type: 'photo',
        '$LocationTag.lat$': { [Op.between]: [swBound.latitude(), neBound.latitude()] },
        '$LocationTag.long$': { [Op.between]: [swBound.longitude(), neBound.longitude()] }
      },
      include: [{
        model: User,
        as: 'Owner',
        association: Photo.associations.Owner,
        include: [{
          model: Photo,
          as: 'CurrentProfilePhoto',
          association: User.associations.CurrentProfilePhoto
        }]
      }, {
        model: LocationTag,
        association: Photo.associations.LocationTag
      }],
      limit: req.query.size,
      offset: req.query.size * (req.query.page - 1)
    })

    photos = photos.map(photo => {
      let response = resScheme.photo(photo, req.user, userPoint)
      return response
    })

    req.states.pageData = photos
    req.states.pageTotalCount = total
    next()
  } catch (error) {
    res.statusCode = 500
    next(error)
  }
})

router.post('/photo', async (req, res, next) => {
  let [lat, long] = req.body.latlong.split(',').map(Number)
  let { image_name, location_name } = req.body
  let extension = req.file.mimetype.split('/')[1]

  await sequelize.transaction(async function (t) {
    try {
      let photo = await req.user.createPhoto({
        type: 'photo',
        name: image_name,
        LocationTag: {
          name: location_name,
          lat,
          long
        },
        extension
      }, {
        include: [{ association: Photo.associations.LocationTag }]
      })

      await photo.upload(req.file)

      res.json({ message: 'Success' })
    } catch (error) {
      res.statusCode = 500
      next(error)
      throw error
    }
  })
})

module.exports = router
