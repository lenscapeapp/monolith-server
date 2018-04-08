const bcrypt = require('bcrypt')
const { Router } = require('express')

const Authentication = require('../middlewares/authentication')
const { Facebook, Auth } = require('../functions')
const { FacebookAuth, LocalAuth, User, sequelize } = require('../models')

const router = new Router()

router.post('/register',
  Authentication.register,
  Authentication.authorize
)

router.post('/login/local',
  Authentication.loginLocal,
  Authentication.authorize
)

router.post('/login/facebook', async (req, res, next) => {
  try {
    let {
      email,
      picture,
      pictureBuffer,
      first_name: firstname,
      last_name: lastname,
      id: facebookId
    } = await Facebook.getProfile(req.body.access_token)

    let [user, uCreated] = await User.findOrCreate({
      where: { email }
    })
    if (uCreated) {
      user.firstname = firstname
      user.lastname = lastname
      await user.save()
    }

    let [facebookAuth, fCreated] = await FacebookAuth.findOrCreate({
      where: { user_id: user.id }
    })
    if (fCreated) {
      facebookAuth.facebook_id = facebookId
      await facebookAuth.save()
    }

    if (!picture.data.is_silhouette & uCreated) {
      let photo = await user.createCurrentProfilePhoto({
        type: 'profile',
        extension: 'jpg',
        name: '',
        owner_id: user.id
      })
      await photo.upload({ buffer: pictureBuffer }, 'image/jpg')
    }

    req.user = user
    next()
  } catch (error) {
    res.statusCode = 500
    return next(error)
  }
}, Auth.authorize)

router.get('/secret', Auth.authenticate, (req, res) => {
  res.json('This is secret that need authentication.')
})

module.exports = router
