const multer = require('multer')
const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const GuardLocation = require('./validator/location')
const GuardPhoto = require('./validator/photo')
const Location = require('../middlewares/location')
const Photo = require('../middlewares/photo')
const Request = require('../middlewares/request')
const Response = require('../middlewares/response')

const router = new Router()

router.route('/photos')
  .get(
    GuardPhoto.aroundme,
    Request.activateGuard,
    Authentication.authenticate,
    Photo.aroundme,
    Response.paginate
  )

router.route('/places')
  .get(
    GuardLocation.aroundme,
    Request.activateGuard,
    Authentication.authenticate,
    Location.aroundme,
    Response.response
  )

module.exports = router
