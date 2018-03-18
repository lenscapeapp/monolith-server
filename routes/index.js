const { Router } = require('express')

const validateRouter = require('./validator')
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
