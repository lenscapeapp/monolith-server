const { matchedData } = require('express-validator/filter')
const { LocationTag, Photo, sequelize } = require('../models')

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
  },

  async getLocation (req, res, next) {
    let {location_id: locationId} = req.data
    let location = await LocationTag.findById(locationId)
    
    res.states.data = location
    next()
  },

  async listLocationPhoto (req, res, next) {
    let { page, size, startId, location_id: locationId } = req.data

    let {count, rows} = await Photo.findAndCount({
      where: {
        locationtag_id: locationId,
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