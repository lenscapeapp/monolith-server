const multer = require('multer')
const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const Guard = require('./validator/auth')
const { Facebook, File } = require('../functions')
const { FacebookAuth, LocalAuth, User, sequelize } = require('../models')

const router = new Router()
const upload = multer({ fileFilter: File.photoFormatFilter })

router.post('/register',
  upload.single('picture'),
  Guard.register,
  Authentication.register,
  Authentication.authorize
)

router.post('/login/local',
  Guard.loginLocal,
  Authentication.loginLocal,
  Authentication.authorize
)

router.post('/login/facebook',
  Guard.loginFacebook,
  Authentication.loginFacebook,
  Authentication.authorize
)

router.get('/secret', Authentication.authenticate, (req, res) => {
  res.json('This is secret that need authentication.')
})

module.exports = router
