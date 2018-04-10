const { Router } = require('express')

const { Auth } = require('../functions')
const Authentication = require('../middlewares/authentication')

const router = new Router()

router.get('/me', Authentication.authenticate, async (req, res, next) => {
  try {
    res.json(await req.user.getProfile())
  } catch (error) {
    next(error)
  }
})

module.exports = router
