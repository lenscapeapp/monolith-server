const GeoPoint = require('geopoint')
const { Router } = require('express')

const { Photo, User, sequelize } = require('../models')
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
        lat: {
          [Op.between]: [swBound.latitude(), neBound.latitude()]
        },
        long: {
          [Op.between]: [swBound.longitude(), neBound.longitude()]
        }
      },
      include: [{
        model: User,
        as: 'owner',
        association: Photo.associations.owner,
        include: [{
          model: Photo,
          as: 'currentProfilePhoto',
          association: User.associations.currentProfilePhoto
        }]
      }],
      limit: req.query.size,
      offset: req.query.size * (req.query.page - 1)
    })

    photos = photos.map(photo => {
      let response = resScheme.photo(photo)
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
  let extension = req.file.mimetype.split('/')[1]

  await sequelize.transaction(async function (t) {
    try {
      let photo = await req.user.createPhoto({
        type: 'photo',
        lat,
        long,
        extension
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
