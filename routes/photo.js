const multer = require('multer')
const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const File = require('../functions/file')
const Guard = require('./validator/photo')
const Photo = require('../middlewares/photo')
const Request = require('../middlewares/request')
const Response = require('../middlewares/response')

const router = new Router()
const upload = multer({ fileFilter: File.photoFormatFilter })

router.get('/aroundme/photos',
  Guard.aroundme,
  Request.activateGuard,
  Authentication.authenticate,
  Photo.aroundme,
  Response.paginate
)

router.post('/photo',
  upload.single('picture'),
  Guard.createPhoto,
  Request.activateGuard,
  Authentication.authenticate,
  Photo.createPhoto,
  Response.response
)

module.exports = router
