const bcrypt = require('bcrypt')
const { Router } = require('express')

const { Facebook, Auth, Resize, Bucket, File } = require('../functions')
const { FacebookAuth, LocalAuth, User, sequelize } = require('../models')

const router = new Router()

router.post('/register',
  async (req, res, next) => {
    const { firstname, lastname, password, email } = req.body
    let hpassword = await bcrypt.hash(password, 10)

    try {
      await sequelize.transaction(async function (t) {
        req.authMethod = await LocalAuth.create({
          hpassword,
          User: { firstname, lastname, email }
        }, {
          transaction: t,
          include: [{ association: LocalAuth.associations.User }]
        })
      })

      req.states.user = await req.authMethod.getUser()
    } catch (error) {
      res.statusCode = 500
      return next(error)
    }

    if (req.file !== undefined) {
      try {
        let extension = req.file.mimetype.split('/')[1]
        let photo = await req.states.user.createPhoto({ type: 'profile', extension })
        let pictureUrls = await File.createProfilePictureBundle(req.file, photo)
        req.userPicture = pictureUrls.thumbnail
      } catch (error) {
        res.statusCode = 500
        return next(error)
      }
    }

    next()
  },
  Auth.authorize
)

router.post('/login/local', async (req, res, next) => {
  const { email, password } = req.body

  try {
    req.states.user = await User.findOne({
      where: { email },
      include: [{ model: LocalAuth }]
    })
  } catch (error) {
    res.statusCode = 500
    return next(error)
  }

  if (req.states.user === null || req.states.user.LocalAuth === null) {
    return res.status(401).json({ message: 'Email or Password is incorrect' })
  }

  let authenticated = await bcrypt.compare(password, req.states.user.LocalAuth.hpassword)
  if (!authenticated) {
    return res.status(401).json({ message: 'Email or Password is incorrect' })
  }

  next()
}, Auth.authorize)

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
      let photo = await user.createPhoto({
        type: 'profile',
        extension: 'jpg'
      })
      let file = { buffer: pictureBuffer, mimetype: 'image/jpg' }
      await File.createProfilePictureBundle(file, photo)
    }

    req.states.user = user
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
