const GeoPoint = require('geopoint')
const { Router } = require('express')

// Logic router
const aroundmeRouter = require('./aroundme')
const authRouter = require('./auth')
const userRouter = require('./user')
const photoRouter = require('./photo')
const locationRouter = require('./location')

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
router.use('/aroundme', aroundmeRouter)
router.use('/location', locationRouter)
router.use('/me', userRouter)

module.exports = router
