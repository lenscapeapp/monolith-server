const GeoPoint = require('geopoint')
const { DEFAULT_PAGE_SIZE } = require('../config/constants')
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

module.exports = {
  location (keyName) {
    return (req, res, next) => {
      let input = matchedData(req)
      let [lat, long] = input.split(',').map(Number)

      req[keyName] = new GeoPoint(lat, long)
    }
  },

  activateGuard (req, res, next) {
    let errors = validationResult(req)

    if (errors.isEmpty()) {
      req.data = Object.assign(req.data || {}, matchedData(req))
      return next()
    }

    let invalids = errors.mapped()
    errors = []
    for (let field in invalids) {
      errors.push({
        field,
        message: invalids[field].msg
      })
    }

    res.status(400).json({
      message: errors[0].message,
      invalid_fields: errors
    })
  },

  paginationValidation: [
    check('page')
      .optional({ checkFalsy: false })
      .isInt({ min: 1 })
      .withMessage('page must be an integer greater than 0')
      .toInt(),
    check('size')
      .optional({ checkFalsy: false })
      .isInt({ min: 1 })
      .withMessage('size must be an integer greater than 0')
      .toInt(),
    check('startId')
      .optional({ checkFalsy: false })
      .isInt({ min: 1 })
      .withMessage('startId must be an integer greater than 0')
      .toInt(),
    (req, res, next) => {
      req.data = Object.assign(req.data || {}, {
        page: 1,
        size: DEFAULT_PAGE_SIZE,
        startId: 0x80000000
      })
      next()
    }
  ]
}
