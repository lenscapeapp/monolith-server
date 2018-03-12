const { Router } = require('express')

const authRouter = require('./auth')

const router = new Router()

router.use('/', authRouter)
router.use('/', require('./test-upload'))

router.get('/', (req, res) => {
  res.json({ message: 'Health check' })
})

module.exports = router
