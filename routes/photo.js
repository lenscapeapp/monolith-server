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

router.route('/photos')
  .get(
    Authentication.authenticate,
    Guard.listPhoto,
    Request.paginationValidation,
    Request.activateGuard,
    Request.getPrefinedStates,
    Photo.listPhoto,
    Response.paginate
  )

router.route('/photo')
  .post(
    upload.single('picture'),
    Authentication.authenticate,
    Guard.createPhoto,
    Request.activateGuard,
    Photo.createPhoto,
    Response.response
  )

router.route('/photo/:photo_id')
  .get(
    Authentication.authenticate,
    Guard.getPhoto,
    Request.activateGuard,
    Photo.getPhoto,
    Response.response
  )
  .delete(
    Authentication.authenticate,
    Guard.deletePhoto,
    Request.activateGuard,
    Photo.deletePhoto,
    Response.response
  )

router.route('/photo/:photo_id/like')
  .get(
    Authentication.authenticate,
    Guard.listLikes,
    Request.activateGuard,
    Photo.listLikes,
    Response.response
  )
  .post(
    Authentication.authenticate,
    Guard.liked,
    Request.activateGuard,
    Photo.liked,
    Response.response
  )
  .delete(
    Authentication.authenticate,
    Guard.unliked,
    Request.activateGuard,
    Photo.unliked,
    Response.response
  )

router.route('/trend')
  .get(
    Authentication.authenticate,
    Request.paginationValidation,
    Request.activateGuard,
    Photo.trend,
    Response.paginate
  )

router.route('/photo/:photo_id/view')
  .post(
    Authentication.authenticate,
    Guard.createView,
    Request.activateGuard,
    Photo.createView,
    Response.response
  )

router.route('/photo/:photo_id/report')
  .post(
    Authentication.authenticate,
    Photo.report,
    Response.response
  )

router.route('/photo/daily')
  .get(
    Authentication.authenticate,
    Request.paginationValidation,
    Request.activateGuard,
    Photo.trend,
    Photo.daily,
    Response.response
  )

module.exports = router
