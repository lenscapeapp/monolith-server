const multer = require('multer')

const { Router } = require('express')
const { body } = require('express-validator/check')

const { File } = require('../../functions')

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
    .isEmail().withMessage('email must be an email'),
  body('password')
    .exists().withMessage('password is missing')
    .isLength({ min: 8, max: 30 }).withMessage('password must be 8-30 characters long')
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
