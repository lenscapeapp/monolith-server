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

async function authorize (req, res) {
  let { user } = req

  let payload = {
    id: user.id,
    exp: now() + A_DAY
  }
  let token = jwt.sign(payload, jwtOptions.secretOrKey)

  if (!req.userPicture) {
    let [picture] = await user.getPhotos({ type: 'profile', active: true })

    if (picture !== undefined) {
      let name = filename.encodePhoto(picture, 'th')
      req.userPicture = bucket.getBucketURL(`uploads/${name}`)
    } else {
      req.userPicture = PLACEHOLDER_PROFILE_URL
    }
  }

  return res.json({
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      picture: req.userPicture
    },
    message: 'Authenticated',
    token
  })
}

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    let user = await User.findOne({ id: payload.id })
    done(null, user)
  } catch (error) {
    done(error)
  }
}))

module.exports = {
  authorize,
  authenticate: passport.authenticate('jwt', { session: false })
}
