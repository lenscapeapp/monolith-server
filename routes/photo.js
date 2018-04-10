const { Router } = require('express')

const photo = require('../middlewares/photo')
const Authentication = require('../middlewares/authentication')

const router = new Router()

router.get('/aroundme/photos',
  Authentication.authenticate,
  photo.aroundme
)

router.post('/photo',
  Authentication.authenticate,
  photo.create
)

module.exports = router
