const { Router } = require('express')

const { Auth } = require('../functions')

const router = new Router()

router.get('/me', Auth.authenticate, async (req, res, next) => {
  try {
    console.log(await req.user.getProfile())
    res.json(await req.user.getProfile())
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router
