const GeoPoint = require('geopoint')
const gmap = require('../functions/gmap')
const { LocationTag, Photo, sequelize } = require('../models')

const Op = sequelize.Op
const RADIUS = 5 // km

module.exports = {
  async aroundme (req, res, next) {
    let [swBound, neBound] = req.location.boundingCoordinates(RADIUS, 0, true)
    let month = req.query.month
    let monthQuery = sequelize.where(sequelize.fn('date_part', 'month', sequelize.col('Photo.createdAt')), month)

    try {
      let {count, rows: photos} = await Photo.scope('withOwner').findAndCount({
        where: sequelize.and(
          { type: 'photo' },
          month > 0 ? monthQuery : {}
        ),
        order: [['createdAt', 'DESC']],
        include: [{
          association: Photo.associations.LocationTag,
          where: {
            lat: { [Op.between]: [swBound.latitude(), neBound.latitude()] },
            long: { [Op.between]: [swBound.longitude(), neBound.longitude()] }
          }
        }],
        limit: req.query.size,
        offset: req.query.size * (req.query.page - 1)
      })

      res.states = {
        count,
        data: photos,
        page: req.query.page,
        size: req.query.size
      }
      next()
    } catch (error) {
      res.statusCode = 500
      next(error)
    }
  },

  async createPhoto (req, res, next) {
    try {
      let photo = await sequelize.transaction(async t => {
        let { image_name: imageName, gplace_id: gplaceId, place_id: placeId, place_type: placeType } = req.data
        if (gplaceId) { placeId = gplaceId; placeType = 'google' }

        let location
        if (placeType === 'lenscape') {
          if (placeId) {
            location = await LocationTag.findOne({ where: { id: placeId } })
          } else {
            let { location_name: locationName, latlong } = req.data
            let [lat, long] = latlong.split(',').map(Number)
            let userLocation = new GeoPoint(lat, long)
            let [swBound, neBound] = userLocation.boundingCoordinates(0.01, 0, true)
            location = (await LocationTag.findOrCreate({
              where: {
                name: locationName,
                lat: { [Op.between]: [swBound.latitude(), neBound.latitude()] },
                long: { [Op.between]: [swBound.longitude(), neBound.longitude()] }
              },
              defaults: {
                name: locationName,
                lat,
                long
              },
              transaction: t
            }))[0]
          }
        } else if (placeType === 'google') {
          let gplace = (await (gmap.place({ placeid: placeId }).asPromise())).json.result

          location = (await LocationTag.findOrCreate({
            where: { google_place_id: placeId },
            defaults: {
              name: gplace.name,
              lat: gplace.geometry.location.lat,
              long: gplace.geometry.location.lng,
              google_place_id: placeId
            },
            transaction: t
          }))[0]
        }
        let photo = await req.user.createPhoto({
          name: imageName,
          extension: req.file.mimetype.split('/')[1],
          type: 'photo'
        }, { transaction: t })
        await location.addPhoto(photo, { transaction: t })
        await photo.upload(req.file)

        return photo
      })

      res.states.data = await Photo.findById(photo.id)
      next()
    } catch (err) {
      res.statusCode = 500
      next(err)
    }
  },

  async listLikes (req, res, next) {
    let { photo_id: photoId } = req.data

    let photo = await Photo.findById(photoId)

    let likedUsers = await photo.getLikedUsers()

    res.states.data = likedUsers
    next()
  },

  async liked (req, res, next) {
    let { photo_id: photoId } = req.data

    let photo = await Photo.findById(photoId)

    let likes = await photo.addLikedUser(req.user)
    photo.number_of_likes += likes[0] ? likes[0].length : 0
    await photo.save()

    res.states.data = photo
    next()
  },

  async unliked (req, res, next) {
    let { photo_id: photoId } = req.data

    let photo = await Photo.findById(photoId)

    let unlikes = await photo.removeLikedUser(req.user)
    photo.number_of_likes -= unlikes
    await photo.save()

    res.states.data = photo
    next()
  }
}
