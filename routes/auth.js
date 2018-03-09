const passport = require('passport')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { Router } = require('express')
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt')

const { LocalAuth, User } = require('../models')

const router = new Router()

const DAY = 1000 * 60 * 60 * 24

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
}

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  let uniqueID = payload.id

  try {
    let user = await User.findOne({ unique_id: uniqueID })
    done(null, user)
  } catch (error) {
    done(error)
  }
}))

router.post('/register', async (req, res) => {
  const { username, password, firstname, lastname } = req.body

  if (!(firstname && lastname && username && password)) {
    res.status(400).send({ message: 'Bad request' })
  }

  let user = null
  let localauth = null

  let hpassword = await bcrypt.hash(password, 5)
  try {
    localauth = await LocalAuth.create({
      username,
      hpassword,
      User: {
        firstname,
        lastname
      }
    }, {
      include: [{
        association: LocalAuth.associations.User
      }]
    })
    user = await localauth.getUser()
  } catch (error) {
    return res.status(400).json({
      message: error.errors[0].message
    })
  }

  return res.status(200).json({
    id: user.unique_id,
    username: localauth.username
  })
})

router.post('/login/local', async (req, res) => {
  const { username, password } = req.body

  if (!(username && password)) {
    res.status(400).send({ message: 'Username or Password is missing' })
  }

  let localauth = null
  let user = null
  try {
    localauth = await LocalAuth.findOne({
      where: { username }
    })
    user = await localauth.getUser()
  } catch (error) {
    console.error(error)
  }

  if (!localauth) {
    return res.status(401).json({ message: 'Invalid credential' })
  }

  let authenticated = await bcrypt.compare(localauth.hpassword, password)
  if (authenticated) {
    return res.status(401).json({ message: 'Invalid credential' })
  }

  const payload = {
    id: user.unique_id,
    exp: Math.floor(Date.now() / 1000) + DAY
  }
  const token = jwt.sign(payload, jwtOptions.secretOrKey)
  res.json({ message: 'authenticated', token })
})

router.post('/login/facebook', async (req, res) => {
  return res.status(500).json({ message: 'Not implemented' })
})

router.get('/secret', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json('This is secret that need authentication.')
})

module.exports = router
