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

router.route('/photo')
  .post(
    upload.single('picture'),
    Guard.createPhoto,
    Request.activateGuard,
    Authentication.authenticate,
    Photo.createPhoto,
    Response.response
  )

router.route('/photo/:photo_id/like')
  .get(
    Guard.listLikes,
    Request.activateGuard,
    Authentication.authenticate,
    Photo.listLikes,
    Response.response
  )
  .post(
    Guard.liked,
    Request.activateGuard,
    Authentication.authenticate,
    Photo.liked,
    Response.response
  )
  .delete(
    Guard.unliked,
    Request.activateGuard,
    Authentication.authenticate,
    Photo.unliked,
    Response.response
  )

module.exports = router
