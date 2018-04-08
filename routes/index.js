const GeoPoint = require('geopoint')
const { Router } = require('express')

const { Auth } = require('../functions')

// Pre-process and valatation router
const validateRouter = require('./validator')

// Logic router
const authRouter = require('./auth')
const userRouter = require('./user')
const photoRouter = require('./photo')

const router = new Router()

// Health Check path
router.get('/', (req, res) => {
  res.json({ message: 'Health check' })
})

router.use('*', (req, res, next) => {
  req.states = {}
  next()
})

router.use('/', validateRouter)

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
router.use('/', userRouter)
router.use('/', photoRouter)

router.use('*', (req, res, next) => {
  let { pageData, pageTotalCount } = req.states
  let { page, size } = req.query
  let indexOffset = (page - 1) * size

  if (pageTotalCount >= 0) {
    res.json({
      pagination: {
        page_information: {
          number: page,
          size: size
        },
        first: indexOffset + 1,
        last: indexOffset + pageData.length,
        total_number_of_page: Math.ceil(pageTotalCount / size),
        total_number_of_entities: pageTotalCount
      },
      data: pageData
    })
  } else if (pageTotalCount === 0) {
    res.json({
      pagination: {
        page_information: {
          number: page,
          size: size
        },
        first: 0,
        last: 0,
        total_number_of_page: 1,
        total_number_of_entities: 0
      },
      data: []
    })
  }
})

module.exports = router
