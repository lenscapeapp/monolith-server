const passport = require('passport')
const jwt = require('jsonwebtoken')
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt')

const { User } = require('../models')
const { SECRET } = require('../config/constants')
const resScheme = require('../response-scheme')

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
}

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
  let user = req.user

  let payload = {
    id: user.id
  }
  let token = jwt.sign(payload, jwtOptions.secretOrKey)

  return res.json({
    user: resScheme(user),
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
