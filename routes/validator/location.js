const { param, query } = require('express-validator/check')

module.exports = {
  listLocation: [
    query('input')
      .exists().withMessage('input is missing'),
    query('latlong')
      .exists().withMessage('latlong is missing')
      .isLatLong()
  ],

  getLocation: [
    param('location_id')
      .exists().withMessage('location_id is missing')
      .isInt({min: 1})
      .withMessage('location_id must be an integer greater than 0')
  ],

  getLocationPhoto: [
    param('location_id')
      .exists().withMessage('location_id is missing')
      .isInt({min: 1})
      .withMessage('location_id must be an integer greater than 0')
  ]
}
