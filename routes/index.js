const { Router } = require('express')

const authRouter = require('./auth')

const router = new Router()

router.use('/', authRouter)

module.exports = router
