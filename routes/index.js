const { Router } = require('express')

const { Auth } = require('../functions')

// Pre-process and valatation router
const validateRouter = require('./validator')

// Logic router
const authRouter = require('./auth')
const userRouter = require('./user')

const router = new Router()

router.use('*', (req, res, next) => {
  req.states = {}
  next()
})

router.use('/', validateRouter)

router.use('/', authRouter)

router.use('/', Auth.authenticate)
router.use('/', userRouter)
router.use('/', require('./photo'))

router.get('/', (req, res) => {
  res.json({ message: 'Health check' })
})

module.exports = router
