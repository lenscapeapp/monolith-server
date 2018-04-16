const GeoPoint = require('geopoint')
const { validationResult } = require('express-validator/check')
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

    if (errors.isEmpty()) { return next() }

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
  }
}
