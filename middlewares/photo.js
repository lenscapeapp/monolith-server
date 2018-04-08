const GeoPoint = require('geopoint')
const { Router } = require('express')

const response = require('../response-scheme')
const { Photo, sequelize } = require('../models')

const Op = sequelize.Op

const RADIUS = 5 // km

module.exports = {
  async aroundme (req, res, next) {
    let [swBound, neBound] = req.location.boundingCoordinates(RADIUS, 0, true)
    let month = req.query.month
    let monthQuery = sequelize.where(sequelize.fn('date_part', 'month', sequelize.col('Photo.createdAt')), month)

    try {
      let {count: total, rows: photos} = await Photo.scope('withOwner').findAndCount({
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

      req.states.pageTotalCount = total
      req.states.pageData = photos.map(photo => response(photo, req))
      next()
    } catch (error) {
      res.statusCode = 500
      next(error)
    }
  },

  async create (req, res, next) {
    let { image_name, location_name } = req.body
    let extension = req.file.mimetype.split('/')[1]

    try {
      await sequelize.transaction(async t => {
        let photo = await req.user.createPhoto({
          type: 'photo',
          name: image_name,
          extension,
          LocationTag: {
            name: location_name,
            lat: req.location.latitude(),
            long: req.location.longitude()
          }
        }, {
          transaction: t
        })

        await photo.upload(req.file)
      })

      res.json({ message: 'Success' })
    } catch (error) {
      res.statusCode = 500
      next(error)
    }
  }
}
