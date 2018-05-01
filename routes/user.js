const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const User = require('../middlewares/user')
const Request = require('../middlewares/request')
const Response = require('../middlewares/response')

const router = new Router()

router.route('/')
  .get(
    User.getUser,
    Response.response
  )

router.route('/photos')
  .get(
    Request.paginationValidation,
    Request.activateGuard,
    User.getPhoto,
    Response.paginate
  )

router.route('/photos/liked')
  .get(
    Request.paginationValidation,
    Request.activateGuard,
    User.getLikedPhoto,
    Response.paginate
  )

router.route('/locations')
  .get(
    User.getUploadLocation,
    Response.response
  )

module.exports = router
