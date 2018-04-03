const passport = require('passport')
const jwt = require('jsonwebtoken')
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt')

const { User } = require('../models')
const filename = require('../functions/file')
const bucket = require('../functions/bucket')
const { PLACEHOLDER_PROFILE_URL, SECRET } = require('../config/constants')

const A_DAY = 60 * 60 * 24
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
}

function now () { return Math.floor(Date.now() / 1000) }

function authenticate (req, res, next) {
  passport.authenticate('jwt', { session: false }, function (err, user, info) {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    req.logIn(user, { session: false }, err => {
      if (err) return next(err)
      return next()
    })
  })(req, res, next)
}

async function authorize (req, res) {
  let { user } = req.states

  let payload = {
    id: user.id
  }
  let token = jwt.sign(payload, jwtOptions.secretOrKey)

  let picture = await user.getCurrentProfilePhoto()

  let pictureUrl = PLACEHOLDER_PROFILE_URL

  if (picture !== null) {
    let name = filename.encodePhoto(picture, 'th')
    pictureUrl = bucket.getBucketURL(`uploads/${name}`)
  }

  return res.json({
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      picture: pictureUrl
    },
    message: 'Authenticated',
    token
  })
}

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    let user = await User.findOne({ where: { id: payload.id } })
    done(null, user)
  } catch (error) {
    done(error, false, { message: 'Unauthorized' })
  }
}))

module.exports = {
  authorize,
  authenticate
}
