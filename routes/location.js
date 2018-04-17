const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const Guard = require('./validator/location')
const Location = require('../middlewares/location')
const Request = require('../middlewares/request')
const Response = require('../middlewares/response')

const router = new Router()

router.route('/locations')
  .get(
    Authentication.authenticate,
    Guard.listLocation,
    Request.activateGuard,
    Location.listLocation,
    Response.response
  )

router.route('/location/:location_id')
  .get(
    Authentication.authenticate,
    Guard.getLocation,
    Request.activateGuard,
    Location.getLocation,
    Response.response
  )

router.route('/location/:location_id/photos')
  .get(
    Authentication.authenticate,
    Guard.getLocationPhoto,
    Request.paginationValidation,
    Request.activateGuard,
    Location.listLocationPhoto,
    Response.paginate
  )

module.exports = router
