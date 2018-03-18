const { Router } = require('express')

const validateRouter = require('./validator')
const authRouter = require('./auth')
const errorRouter = require('./errorhandler')

const router = new Router()

router.use('*', (req, res, next) => {
  req.states = {}
  next()
})

router.use('/', validateRouter)

router.use('/', authRouter)

router.use('/', errorRouter)

router.get('/', (req, res) => {
  res.json({ message: 'Health check' })
})

module.exports = router
