const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt')

const response = require('../response-scheme')
const { SECRET } = require('../config/constants')
const { LocalAuth, User, sequelize } = require('../models')

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
}

passport.use(new JwtStrategy(jwtOptions, (payload, done) => {
  User.findOne({ where: { id: payload.id } })
    .then(user => {
      done(null, user)
    })
    .catch(err => {
      done(err, false, { message: 'Unauthorized' })
    })
}))

module.exports = {
  async register (req, res, next) {
    const { firstname, lastname, email, password } = req.body
    let hpassword = await bcrypt.hash(password, 10)

    try {
      await sequelize.transaction(async t => {
        let localauth = await LocalAuth.create({
          hpassword,
          User: { firstname, lastname, email }
        }, {
          transaction: t,
          include: [{ association: LocalAuth.associations.User }]
        })

        req.user = localauth.User

        if (req.file !== undefined) {
          let extension = req.file.mimetype.split('/')[1]
          let photo = await req.user.createCurrentProfilePhoto({
            type: 'profile',
            name: '',
            owner_id: req.user.id,
            extension
          }, { transaction: t })
          let pictureUrls = await photo.upload(req.file, req.file.mimetype)
          req.userPicture = pictureUrls.thumbnail
        }
      })
    } catch (error) {
      res.statusCode = 500
      return next(error)
    }
    next()
  },

  async loginLocal (req, res, next) {
    const { email, password } = req.body

    try {
      req.user = await User.findOne({
        where: { email },
        include: [{ association: User.associations.LocalAuth }]
      })
    } catch (error) {
      res.statusCode = 500
      next(error)
    }
    if (req.user === null || req.user.LocalAuth === null) {
      return res.status(401).json({ message: 'Email or Password is incorrect' })
    }

    let authenticated = await bcrypt.compare(password, req.user.LocalAuth.hpassword)
    if (!authenticated) {
      return res.status(401).json({ message: 'Email or Password is incorrect' })
    }

    next()
  },

  loginFacebook (req, res, next) {

  },

  async authorize (req, res, next) {
    let user = await User.findOne({ where: { id: req.user.id } })

    let payload = { id: user.id }
    let token = jwt.sign(payload, jwtOptions.secretOrKey)

    return res.json({
      user: response(user),
      message: 'Authenticated',
      token
    })
  },

  authenticate (req, res, next) {
    passport.authenticate('jwt', (err, user, info) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      req.logIn(user, { session: false }, err => {
        if (err) return next(err)
        return next()
      })
    })(req, res, next)
  }
}
