const { Router } = require('express')

const Guard = require('./validator/location')
const Location = require('../middlewares/location')
const Request = require('../middlewares/request')
const Response = require('../middlewares/response')

const router = new Router()

router.route('/locations')
  .get(
    Guard.listLocation,
    Request.activateGuard,
    Location.listLocation,
    Response.response
  )

module.exports = router
