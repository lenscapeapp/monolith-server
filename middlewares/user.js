const { Photo, sequelize, Like } = require('../models')

const Op = sequelize.Op

module.exports = {
  getUser (req, res, next) {
    res.states.data = req.user
    next()
  },

  async getPhoto (req, res, next) {
    let { page, size, startId } = req.data
    let {count, rows} = await Photo.findAndCount({
      where: {
        type: 'photo',
        owner_id: req.user.id,
        id: {
          [Op.lte]: startId
        }
      },
      order: [['createdAt', 'DESC']],
      limit: size,
      offset: size * (page - 1)
    })

    res.states.data = rows
    res.states.count = count
    res.states.page = page
    res.states.size = size
    next()
  },

  async getLikedPhoto (req, res, next) {
    let { page, size, startId } = req.data

    let {count, rows} = await Photo.findAndCount({
      where: {
        type: 'photo',
        id: { [Op.lte]: startId }
      },
      include: [{
        association: Photo.associations.LikedUsers,
        through: {
          where: { user_id: req.user.id }
        },
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
  }
}
