const multer = require('multer')
const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const Guard = require('./validator/auth')
const Request = require('../middlewares/request')
const Response = require('../middlewares/response')
const { File } = require('../functions')

const router = new Router()
const upload = multer({ fileFilter: File.photoFormatFilter })

router.post('/register',
  upload.single('picture'),
  Guard.register,
  Request.activateGuard,
  Authentication.register,
  Authentication.authorize,
  Response.response
)

router.post('/login/local',
  Guard.loginLocal,
  Request.activateGuard,
  Authentication.loginLocal,
  Authentication.authorize,
  Response.response
)

router.post('/login/facebook',
  Guard.loginFacebook,
  Request.activateGuard,
  Authentication.loginFacebook,
  Authentication.authorize,
  Response.response
)

router.get('/secret', Authentication.authenticate, (req, res) => {
  res.json('This is secret that need authentication.')
})

module.exports = router
