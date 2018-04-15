const { body, query, oneOf } = require('express-validator/check')

const gmap = require('../../functions/gmap')

const DEFAULT_PAGE_SIZE = 25
const MAX_INT = Math.pow(2 ^ 31)

module.exports = {
  aroundme: [
    query('latlong')
      .exists().withMessage('latlong is required')
      .isLatLong().withMessage('latlong is not valid'),
    query('page')
      .optional()
      .isInt().withMessage('page must be an integer')
      .toInt(),
    query('size')
      .optional()
      .isInt().withMessage('size must be an integer')
      .toInt(),
    query('startId')
      .optional()
      .isInt().withMessage('start ID must be an integer')
      .toInt(),
    query('month')
      .optional()
      .isInt()
      .isLength({ min: 0, max: 12 }).withMessage('month must be an integer between 0 and 12 (inclusive)')
      .toInt(),
    (req, res, next) => {
      req.query.page = req.query.page || 1
      req.query.size = req.query.size || DEFAULT_PAGE_SIZE
      req.query.startId = req.query.startId || MAX_INT
      req.query.month = req.query.month || 0
      next()
    }
  ],

  createPhoto: [
    oneOf([
      [
        body('latlong')
          .exists().withMessage('latlong is missing'),
        body('location_name')
          .exists().withMessage('location_name is missing')
      ],
      body('gplace_id')
        .exists().withMessage('gplace_id is missing')
    ], 'either latlong and location_name or gplace_id is required'),
    body('latlong')
      .optional()
      .isLatLong().withMessage('latlong value is invalid'),
    body('image_name')
      .exists().withMessage('image_name is missing'),
    body('gplace_id')
      .optional()
      .custom(value => {
        return gmap.place({ placeid: value }).asPromise()
          .then(res => {
            return res && res.json && res.json.result
          })
          .catch(e => {
            throw new Error('invalid gplace_id')
          })
      }),
    (req, res, next) => {
      if (req.file) return next()
      if (!req.body.picture) {
        return res.status(400).json({ message: 'picture is missing' })
      }

      let buffer = Buffer.from(req.body.picture, 'base64')
      let fileSignature = buffer.slice(0, 2).toString('hex')
      let isJPG = fileSignature === 'ffd8'
      let isPNG = fileSignature === '8950'

      if (!isJPG && !isPNG) {
        return res.status(400).json({ message: 'Only JPG/PNG is allowed' })
      }

      let mimetype = 'image/' + (isJPG ? 'jpg' : (isPNG ? 'png' : '*'))
      req.file = {
        mimetype,
        buffer
      }
      next()
    }
  ]
}
