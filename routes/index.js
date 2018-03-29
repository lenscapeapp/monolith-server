const { Router } = require('express')

const { Auth } = require('../functions')

// Pre-process and valatation router
const validateRouter = require('./validator')

// Logic router
const authRouter = require('./auth')
const userRouter = require('./user')

const router = new Router()

router.get('/', (req, res) => {
  res.json({ message: 'Health check' })
})

router.use('*', (req, res, next) => {
  req.states = {}
  next()
})

router.use('/', validateRouter)

router.use('/', authRouter)

// router require authencitation
router.use('/', Auth.authenticate)
router.use('/', userRouter)
router.use('/', require('./photo'))

router.use('/', (req, res, next) => {
  let { pageData, pageTotalCount } = req.states
  let { page, size } = req.query
  let indexOffset = (page - 1) * size

  if (pageTotalCount) {
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
  }
})

module.exports = router
