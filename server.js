const express = require('express')
const bodyParser = require('body-parser')

const rootRouter = require('./routes')
const CONSTANTS = require('./config/constants')

const port = 8080

const app = express()

app.enable('trust proxy')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
  console.log({
    url: req.originalUrl,
    ip: req.ip,
    proxies: req.ips
  })
  next()
})
app.use('/', rootRouter)

app.use((err, req, res, next) => {
  if (res.statusCode >= 500 && res.statusCode <= 599) {
    if (CONSTANTS.IS_PRODUCTION) {
      res.sendStatus(res.statusCode)
      console.error(err)
    } else {
      res.status(res.statusCode).json(err)
    }
  } else {
    res.sendStatus(res.statusCode).json({
      message: res.message
    })
  }
})

app.listen(port)

module.exports = app
