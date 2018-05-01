const GeoPoint = require('geopoint')
const { Router } = require('express')

const { PARTS_OF_DAY, SEASONS } = require('../config/constants')

// Logic router
const aroundmeRouter = require('./aroundme')
const authRouter = require('./auth')
const userRouter = require('./user')
const photoRouter = require('./photo')
const locationRouter = require('./location')
const notificationRouter = require('./notification')

const Request = require('../middlewares/request')
const UserValidator = require('./validator/user')
const Authentication = require('../middlewares/authentication')
const { User } = require('../models')

const router = new Router()

// Health Check path
router.get('/', (req, res) => {
  res.json({ message: 'Health check' })
})

router.use('*', (req, res, next) => {
  req.states = {}
  res.states = {}
  next()
})

// predefined-states
router.use('*', (req, res, next) => {
  let latlongString = req.body.latlong || req.query.latlong

  if (latlongString) {
    let [lat, long] = latlongString.split(',').map(each => Number(each))
    req.location = new GeoPoint(lat, long)
  }

  next()
})

router.use('/', authRouter)
router.use('/', photoRouter)
router.use('/', notificationRouter)
router.use('/aroundme', aroundmeRouter)
router.use('/location', locationRouter)
router.use('/me|/user/:user_id',
  Authentication.authenticate,
  UserValidator.getOtherUser,
  Request.activateGuard,
  async (req, res, next) => {
    if (req.data.user_id) {
      req.asUser = await User.findById(req.data.user_id)
    } else {
      req.asUser = req.user
    }
    next()
  },
  userRouter
)

router.route('/seasons')
  .get(
    (req, res, next) => {
      let data = SEASONS.map((season, index) => {
        return {
          id: index,
          name: season
        }
      })
      res.json({ data })
    }
  )

router.route('/times')
  .get(
    (req, res, next) => {
      let data = PARTS_OF_DAY.map((season, index) => {
        return {
          id: index,
          name: season
        }
      })
      res.json({ data })
    }
  )

module.exports = router
