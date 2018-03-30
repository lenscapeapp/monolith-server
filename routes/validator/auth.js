const multer = require('multer')

const { Router } = require('express')
const { body } = require('express-validator/check')

const { File } = require('../../functions')
const { User } = require('../../models')

const router = new Router()
const upload = multer({ fileFilter: File.photoFormatFilter })

router.post('/register', upload.single('picture'),
  body('firstname')
    .exists().withMessage('firstname is missing')
    .matches(/^[a-z]+$/i).withMessage('firstname can contain only characters'),
  body('lastname')
    .exists().withMessage('lastname is missing')
    .matches(/^[a-z]+$/i).withMessage('lastname can contain only characters'),
  body('email')
    .exists().withMessage('email is missing')
    .isEmail().withMessage('email must be an email')
    .custom(value => {
      return User.findOne({ where: { email: value } }).then(user => {
        if (user !== null) throw new Error('This email is already used.')
      })
    }),
  body('password')
    .exists().withMessage('password is missing')
    .isLength({ min: 8, max: 30 }).withMessage('password must be 8-30 characters long'),
  (req, res, next) => {
    if (req.file) return next()
    if (!req.body.picture) return next()

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
)

router.post('/login/local'
  , body('email')
    .exists()
  , body('password')
    .exists()
)

router.post('/login/facebook',
  body('access_token')
    .exists()
)

module.exports = router
