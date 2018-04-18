const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const User = require('../middlewares/user')
const Request = require('../middlewares/request')
const Response = require('../middlewares/response')

const router = new Router()

router.route('/')
  .get(
    Authentication.authenticate,
    User.getUser,
    Response.response
  )

router.route('/photos')
  .get(
    Authentication.authenticate,
    Request.paginationValidation,
    Request.activateGuard,
    User.getPhoto,
    Response.paginate
  )

router.route('/photos/liked')
  .get(
    Authentication.authenticate,
    Request.paginationValidation,
    Request.activateGuard,
    User.getLikedPhoto,
    Response.paginate
  )

module.exports = router
