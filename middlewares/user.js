const { Photo, sequelize, LocationTag } = require('../models')

const Op = sequelize.Op

module.exports = {
  getUser (req, res, next) {
    res.states.data = req.asUser
    next()
  },

  async getPhoto (req, res, next) {
    let { page, size, startId } = req.data

    let whereClause = {
      type: 'photo',
      owner_id: req.asUser.id,
      id: {
        [Op.lte]: startId
      }
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
  },

  async getLikedPhoto (req, res, next) {
    let { page, size, startId } = req.data
    let {count, rows} = await Photo.scope(['withOwner', 'withLocation']).findAndCount({
      where: {
        type: 'photo',
        id: { [Op.lte]: startId }
      },
      include: [{
        association: Photo.associations.LikedUsers,
        through: {
          where: { user_id: req.asUser.id }
        },
        required: true,
        duplicating: false // This is here to prevent subquery generation https://github.com/sequelize/sequelize/issues/3007
      }],
      order: [['LikedUsers', 'createdAt', 'DESC']],
      limit: size,
      offset: size * (page - 1)
    })

    res.states.data = rows
    res.states.count = count
    res.states.page = page
    res.states.size = size
    next()
  },

  async getUploadLocation (req, res, next) {
    let locations = await LocationTag.findAll({
      include: [{
        association: LocationTag.associations.Photos,
        required: true,
        where: {
          owner_id: req.asUser.id,
          type: 'photo'
        }
      }],
      order: [['Photos', 'createdAt', 'DESC']]
    })

    locations.forEach(location => {
      location.pagedPhotos = location.Photos.slice(0, 4)
    })

    res.states.data = locations
    next()
  }
}
