const gmap = require('../functions/gmap')
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

  async create (req, res, next) {
    let { image_name, location_name, latlong } = req.body
    let extension = req.file.mimetype.split('/')[1]
    
    let gplace
    let latitude
    let longitude
    if (req.body.gplace_id) {
      gplace = (await (gmap.place({ placeid: req.body.gplace_id }).asPromise())).json.result
      latitude = gplace.geometry.location.lat
      longitude = gplace.geometry.location.lng
      location_name = gplace.name
    } else {
      let [lat, long] = latlong.split(',').map(Number)
      latitude = lat
      longitude = long
    }
    
    try {
      let photo = await sequelize.transaction(async t => {
        let photo = await req.user.createPhoto({
          type: 'photo',
          name: image_name,
          extension,
          LocationTag: {
            name: location_name,
            lat: latitude,
            long: longitude
          }
        }, {
          transaction: t,
          include: [{ association: Photo.associations.LocationTag }]
        })

        await photo.upload(req.file)
        return photo
      })

      photo = await Photo.findById(photo.id)
      res.states.data = photo
      next()
    } catch (error) {
      console.log(error)
      res.statusCode = 500
      next(error)
    }
  }
}
