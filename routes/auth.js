const passport = require('passport')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const { Router } = require('express')
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt')

const { LocalAuth, User } = require('../models')

const router = new Router()

const DAY = 60 * 60 * 24

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
  const { password, firstname, lastname, email } = req.body

  if (!(firstname && lastname && password)) {
    res.status(400).send({ message: 'Bad request' })
  }

  let user = null
  let localauth = null

  let hpassword = await bcrypt.hash(password, 5)
  try {
    localauth = await LocalAuth.create({
      hpassword,
      User: {
        firstname,
        lastname,
        email
      }
    }, {
      include: [{
        association: LocalAuth.associations.User
      }]
    })
    user = await localauth.getUser()
  } catch (error) {
    if (error.name.includes(sequelize.UniqueConstraintError.name)) {
      return res.status(400).json({
        message: 'Email is already used.'
      })
    } else {
      return res.status(400).json(error)
    }
  }
  let token = jwt.sign({
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + DAY
  }, jwtOptions.secretOrKey)

  return res.status(200).json({
    message: 'Authenticated',
    token
  })
})

router.post('/login/local', async (req, res) => {
  const { email, password } = req.body

  if (!(email && password)) {
    res.status(400).send({ message: 'Email or Password is missing' })
  }

  let localauth = null
  let user = null
  try {
    user = await User.findOne({
      where: { email }
    })
    localauth = await user.getLocalAuth()
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
    id: user.id,
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
