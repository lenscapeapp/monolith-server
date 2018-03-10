const { Router } = require('express')

const authRouter = require('./auth')

const router = new Router()

router.use('/', authRouter)
router.use('/', require('./test-upload'))

module.exports = router
