const { matchedData } = require('express-validator/filter')
const { LocationTag, sequelize } = require('../models')

const Op = sequelize.Op

module.exports = {
  async listLocation (req, res, next) {
    let {count, rows: locations} = await LocationTag.findAndCount({
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
  }
}