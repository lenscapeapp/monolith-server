const { Router } = require('express')

const { Auth } = require('../functions')

const router = new Router()

router.get('/me', Auth.authenticate, async (req, res, next) => {
  try {
    res.json(await req.user.getProfile())
  } catch (error) {
    next(error)
  }
})

module.exports = router
