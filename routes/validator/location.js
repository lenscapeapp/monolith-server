const { query } = require('express-validator/check')

module.exports = {
  listLocation: [
    query('input')
      .exists().withMessage('input is missing'),
    query('latlong')
      .exists().withMessage('latlong is missing')
      .isLatLong()
  ]
}
