const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const { Router } = require('express')

const router = new Router()

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
}

function getFalseInfo () {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: 'falseUser', id: -1 })
    }, 500)
  })
}

passport.use(new JwtStrategy(options, async (payload, done) => {
  const falseInfo = await getFalseInfo()

  if (falseInfo) {
    done(null, falseInfo)
  } else {
    done(null, false)
  }
}))

router.post('/login', async (req, res) => {
  // TODO: check for login information in req.body
  if (true) {}

  const falseInfo = await getFalseInfo()

  // TODO: check password/secrets
  if (true) {
    const payload = falseInfo
    const token = jwt.sign(payload, options.secretOrKey)
    res.json({ message: 'authenticated', token })
  } else {
    res.status(401).json({ message: 'Invalid credential' })
  }
})

router.get('/secret', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json('This is secret that need authentication.')
})

module.exports = router
