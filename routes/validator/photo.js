const multer = require('multer')
const { body, query } = require('express-validator/check')
const { Router } = require('express')

const { File } = require('../../functions')

const DEFAULT_PAGE_SIZE = 25
const MAX_INT = Math.pow(2 ^ 31)

const router = new Router()
const upload = multer({ fileFilter: File.photoFormatFilter })

router.get('/aroundme/photos',
  query('latlong')
    .exists().withMessage('latlong is required')
    .isLatLong().withMessage('latlong is not valid'),
  query('page')
    .optional()
    .isInt().withMessage('page must be an integer'),
  query('size')
    .optional()
    .isInt().withMessage('size must be an integer'),
  query('startId')
    .optional()
    .isInt().withMessage('start ID must be an integer'),
  query('month')
    .optional()
    .isInt()
    .isLength({ min: 0, max: 12 }).withMessage('month must be an integer between 0 and 12 (inclusive)'),
  (req, res, next) => {
    req.query.page = req.query.page || 1
    req.query.size = req.query.size || DEFAULT_PAGE_SIZE
    req.query.startId = req.query.startId || MAX_INT
    req.query.month = req.query.month || 0
    next()
  }
)

router.post('/photo', upload.single('picture'),
  body('latlong')
    .exists().withMessage('latlong is missing')
    .isLatLong().withMessage('latlong value is invalid'),
  (req, res, next) => {
    if (req.file) return next()
    res.status(400).json({ message: 'picture is missing' })
  }
)

module.exports = router
