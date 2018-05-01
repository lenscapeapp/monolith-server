const GeoPoint = require('geopoint')
const gmap = require('../functions/gmap')
const { Like, LocationTag, Photo, sequelize } = require('../models')
const { DEFAULT_QUERY_RADIUS, PARTS_OF_DAY, SEASONS } = require('../config/constants')

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
        let { date_taken: dateTaken, season, time_taken: timeTaken } = req.data
        dateTaken = new Date(dateTaken)
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
          type: 'photo',
          date_taken: dateTaken,
          season: SEASONS[season],
          part_of_day: PARTS_OF_DAY[timeTaken]
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

  async deletePhoto (req, res, next) {
    let photo = await Photo.findById(req.data.photo_id)
    await Like.destroy({ where: { photo_id: req.data.photo_id } })
    await photo.destroy()

    res.states.data = photo
    next()
  },

  async listLikes (req, res, next) {
    let { photo_id: photoId } = req.data

    let photo = await Photo.findById(photoId)

    let likedUsers = await photo.getLikedUsers()

    res.states.data = likedUsers
    next()
  },

  async listPhoto (req, res, next) {
    let { page, size, startId, month, targetLocation, season, time_taken: timeTaken } = req.data
    let [swBound, neBound] = targetLocation.boundingCoordinates(DEFAULT_QUERY_RADIUS, 0, true)

    let monthQuery = sequelize.where(sequelize.fn('date_part', 'month', sequelize.col('Photo.createdAt')), month)
    let filter = { type: 'photo', id: { [Op.lte]: startId } }
    if (SEASONS[season]) filter.season = SEASONS[season]
    if (PARTS_OF_DAY[timeTaken]) filter.part_of_day = PARTS_OF_DAY[timeTaken]

    try {
      let whereClause = sequelize.and(
        filter,
        month > 0 ? monthQuery : {}
      )
      let include = [{
        association: Photo.associations.LocationTag,
        where: {
          lat: { [Op.between]: [swBound.latitude(), neBound.latitude()] },
          long: { [Op.between]: [swBound.longitude(), neBound.longitude()] }
        }
      }]
      let [count, rows] = await Promise.all([
        Photo.scope(null).count({
          where: whereClause,
          include
        }),
        Photo.scope('withOwner', 'withLikes').findAll({
          where: whereClause,
          order: [['createdAt', 'DESC']],
          include,
          limit: size,
          offset: size * (page - 1)
        })
      ])
      res.states = {
        count,
        data: rows,
        page,
        size
      }
      next()
    } catch (error) {
      res.statusCode = 500
      next(error)
    }
  },

  async liked (req, res, next) {
    let { photo_id: photoId } = req.data

    let photo = await Photo.findById(photoId)

    let likes = await photo.addLikedUser(req.user)
    photo = await photo.increment('number_of_likes', { by: likes[0] ? likes[0].length : 0 })

    photo = await photo.reload()
    res.states.data = photo
    next()
  },

  async unliked (req, res, next) {
    let { photo_id: photoId } = req.data

    let photo = await Photo.findById(photoId)

    let unlikes = await photo.removeLikedUser(req.user)
    photo = await photo.decrement('number_of_likes', { by: unlikes })

    photo = await photo.reload()
    res.states.data = photo
    next()
  },

  async trend (req, res, next) {
    let now = Date.now()
    let {count, rows} = await Photo.findAndCount({
      where: {
        type: 'photo',
        id: { [Op.lte]: req.data.startId },
        createdAt: { [Op.gt]: new Date(now - 30 * 24 * 60 * 60 * 1000) }
      }
    })

    rows.forEach(photo => {
      photo.score = photo.LikedUsers.map(likedUser => {
        let time = now - likedUser.Like.createdAt.getTime()
        let dayDifference = time / (24 * 60 * 60 * 1000)
        if (dayDifference <= 1) { return 1 }
        return Math.pow(2, -((dayDifference - 1) / 7))
      }).reduce((acc, val) => acc + val, 0)
    })

    rows.sort((a, b) => b.score - a.score)
    let lastIndex = req.data.size * req.data.page < rows.length ? req.data.size * req.data.page : rows.length
    let output = rows.slice(req.data.size * (req.data.page - 1), lastIndex)
    res.states.count = count
    res.states.data = output
    res.states.page = req.data.page
    res.states.size = req.data.size
    next()
  },

  async createView (req, res, next) {
    let photo = await Photo.findById(req.data.photo_id)
    photo.viewcount += 1
    await photo.save()

    photo = await photo.reload()
    res.states.data = photo
    next()
  },

  async daily (req, res, next) {
    res.states.data = res.states.data[0]
    next()
  },

  async getPhoto (req, res, next) {
    let photo = await Photo.findById(req.data.photo_id)

    res.states.data = photo
    next()
  }
}
