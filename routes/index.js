const { Router } = require('express')

// Pre-process and valatation router
const validateRouter = require('./validator')

// Logic router
const authRouter = require('./auth')

const router = new Router()

router.use('*', (req, res, next) => {
  req.states = {}
  next()
})

router.use('/', validateRouter)

router.use('/', authRouter)

router.get('/', (req, res) => {
  res.json({ message: 'Health check' })
})

module.exports = router
