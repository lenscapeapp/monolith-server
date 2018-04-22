const { body, param, query, oneOf } = require('express-validator/check')

const gmap = require('../../functions/gmap')
const { LocationTag, Photo } = require('../../models')
const { PARTS_OF_DAY, SEASONS } = require('../../config/constants')

const DEFAULT_PAGE_SIZE = 25
const MAX_INT = Math.pow(2, 31)

module.exports = {
  aroundme: [
    query('latlong')
      .exists().withMessage('latlong is required')
      .isLatLong().withMessage('latlong is not valid'),
    query('page')
      .optional({ checkFalsy: false })
      .isInt()
      .isLength({ min: 1 })
      .withMessage('page must be an integer greater than 0')
      .toInt(),
    query('size')
      .optional({ checkFalsy: false })
      .isInt()
      .isLength({ min: 1 })
      .withMessage('size must be an integer greater than 0')
      .toInt(),
    query('startId')
      .optional({ checkFalsy: false })
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
        .exists().withMessage('gplace_id is missing'),
      body('place_id')
        .exists().withMessage('place_id is missing')

    ], 'either latlong and location_name or gplace_id or place_id and place_type is required'),
    body('latlong').optional({ checkFalsy: false })
      .isLatLong().withMessage('latlong value is invalid'),
    body('image_name')
      .exists().withMessage('image_name is missing'),
    body('gplace_id').optional()
      .custom(value => {
        if (!value) { return new Promise(resolve => resolve(undefined)) }
        return gmap.place({ placeid: value }).asPromise()
          .then(res => {
            return res && res.json && res.json.result
          })
          .catch(e => {
            throw new Error('invalid gplace_id')
          })
      }),
    body('place_type').exists().withMessage('place_type is missing')
      .trim()
      .customSanitizer(value => value.toLowerCase())
      .isIn(['google', 'lenscape']),
    body('place_id').optional({ nullable: false, checkFalsy: false })
      .custom((value, { req }) => {
        if (!value) { return new Promise((resolve) => resolve(undefined)) }
        let type = req.body.place_type
        if (type === 'google') {
          return gmap.place({ placeid: value }).asPromise()
            .then(res => {
              return res && res.json && res.json.result
            })
            .catch(e => {
              throw new Error('invalid google place id')
            })
        } else if (type === 'lenscape') {
          let id = Number(value)
          if (isNaN(id)) throw new Error('lenscape place id must be an integer')
          return LocationTag.findOne({ where: { id } })
            .then(location => {
              if (location === null) {
                throw new Error('invalid lenscape place id')
              }
              return location
            })
        }
      }),
    body('season')
      .exists().withMessage('season is missing')
      .isInt({ min: 0, max: SEASONS.length - 1 }).withMessage(`season must be an integer from 0 to ${SEASONS.length - 1}`),
    body('time_taken')
      .exists().withMessage('time_taken is missing')
      .isInt({ min: 0, max: PARTS_OF_DAY.length - 1 }).withMessage(`time_taken must be an integer from 0 to ${PARTS_OF_DAY.length - 1}`),
    body('date_taken')
      .exists().withMessage('date_taken is missing')
      .isInt({ min: 0 }).withMessage('date_taken must be an UNIX timestamp ')
      .toInt(),
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
  ],

  listLikes: [
    param('photo_id')
      .exists()
      .isInt({ min: 1 })
      .withMessage('photo_id must be an integer greater than 0')
      .toInt()
      .custom(value => {
        return Photo.findById(value)
          // .then(res => )
          .catch(() => { throw new Error(`cannot find photo with id=${value}`) })
      })
  ],

  listPhoto: [
    query('target_latlong')
      .exists().withMessage('target_latlong is missing')
      .isLatLong().withMessage('target_latlong must be in "latitude,longitude" format'),
    query('user_latlong')
      .exists().withMessage('user_latlong is missing')
      .isLatLong().withMessage('user_latlong must be in "latitude,longitude" format'),
    query('month')
      .optional()
      .isInt({min: 0, max: 12})
      .withMessage('month must be an integer between 0 and 12'),
    (req, res, next) => {
      req.data = Object.assign(req.data || {}, {
        month: 0
      })
      next()
    }
  ],

  liked: [
    param('photo_id')
      .exists()
      .isInt({ min: 1 })
      .withMessage('photo_id must be an integer greater than 0')
      .toInt()
      .custom(value => {
        return Photo.findById(value)
          // .then(res => )
          .catch(() => { throw new Error(`cannot find photo with id=${value}`) })
      })
  ],

  unliked: [
    param('photo_id')
      .exists()
      .isInt({ min: 1 })
      .withMessage('photo_id must be an integer greater than 0')
      .toInt()
      .custom(value => {
        return Photo.findById(value)
          .catch(() => { throw new Error(`cannot find photo with id=${value}`) })
      })
  ]
}
