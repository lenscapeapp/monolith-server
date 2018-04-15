const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const request = require('request-promise-native')
const { Facebook } = require('fb')
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

  async loginFacebook (req, res, next) {
    let fb = new Facebook({ version: 'v2.12', accessToken: req.body.access_token })
    let profile = await fb.api('me', { fields: ['id', 'first_name', 'last_name', 'email', 'picture.width(1200).height(1200)'] })

    try {
      await sequelize.transaction(async t => {
        let [user, created] = await User.findOrCreate({
          where: sequelize.or(
            { email: profile.email },
            { '$FacebookAuth.facebook_id$': profile.id }
          ),
          defaults: {
            email: profile.email,
            firstname: profile.first_name,
            lastname: profile.last_name,
            FacebookAuth: {
              facebook_id: profile.id
            }
          },
          include: [{ association: User.associations.FacebookAuth }],
          transaction: t
        })
    
        if (user.FacebookAuth === null) {
          await user.createFacebookAuth({ facebook_id: profile.id }, { transaction: t })
        }
        if (!profile.picture.data.is_silhouette & created) {
          let photo = await user.createCurrentProfilePhoto({
            type: 'profile',
            extension: 'jpg',
            name: '',
            owner_id: user.id
          }, { transaction: t })
          let buffer = await request.get(profile.picture.data.url, { encoding: null })
          await photo.upload({ buffer }, 'image/jpg')
        }
  
        req.user = user
      })
    } catch (error) {
      res.statusCode = 500
      return next(error)
    }
    next()
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
