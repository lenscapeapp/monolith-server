const passport = require('passport')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { Router } = require('express')
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt')

const models = require('../models')

const router = new Router()

const DAY = 1000 * 60 * 60 * 24

const jwtOptions = {
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

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  const falseInfo = await getFalseInfo()

  if (falseInfo) {
    done(null, falseInfo)
  } else {
    done(null, false)
  }
}))

router.post('/register', async (req, res) => {
  const { LocalAuth } = models
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

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  // TODO: check for login information in req.body
  if (!(username && password)) {
    res.status(400).send({ message: 'Username or Password is missing' })
  }

  let localauth = null
  let user = null
  try {
    localauth = await models.LocalAuth.findOne({ 
      where: { username }
    })
    user = await localauth.getUser()
    console.log()
  } catch (error) {
    // handle error
    console.log('------------------')
    console.error(error)
  }

  if (!localauth) {
    return res.status(401).json({ message: 'Invalid credential' })
  }

  // TODO: check password/secrets
  let authenticated = await bcrypt.compare(localauth.hpassword, password)
  if (authenticated) {
    return res.status(401).json({ message: 'Invalid credential' })
  }

  const payload = {
    id: user.unique_id,
    exp: Math.floor(Date.now() / 1000) + 1000
  }
  const token = jwt.sign(payload, jwtOptions.secretOrKey)
  res.json({ message: 'authenticated', token })
})

router.get('/secret', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json('This is secret that need authentication.')
})

module.exports = router
