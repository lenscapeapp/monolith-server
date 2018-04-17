const { Photo, sequelize } = require('../models')

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
  }
}
