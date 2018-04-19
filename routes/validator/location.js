const { param, query } = require('express-validator/check')

const { DEFAULT_NEARBY_RADIUS, DEFAULT_PAGE_SIZE } = require('../../config/constants')

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
  ],

  aroundme: [
    query('latlong')
      .exists().withMessage('latlong is required')
      .isLatLong().withMessage('latlong is not valid'),
    query('search')
      .optional({checkFalsy: false}),
    query('radius')
      .optional({checkFalsy: false})
      .isInt({min: 0})
      .withMessage('radius must be an integer greater than 0')
      .toInt(),
    (req, res, next) => {
      req.data = Object.assign(req.data || {}, {
        radius: DEFAULT_NEARBY_RADIUS
      })
      next()
    }
  ]
}
