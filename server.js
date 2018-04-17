const express = require('express')
const bodyParser = require('body-parser')

const logger = require('./config/logger')
const rootRouter = require('./routes')
const CONSTANTS = require('./config/constants')

const port = 8080

const app = express()

app.enable('trust proxy')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
  logger.info({
    url: req.originalUrl,
    ip: req.ip,
    proxies: req.ips
  })
  next()
})
app.use('/', rootRouter)

app.use((err, req, res, next) => {
  let { message, name, stack } = err
  logger.error({ message, name, stack })
  if (res.statusCode >= 500 && res.statusCode <= 599) {
    if (!CONSTANTS.DEBUG && CONSTANTS.IS_PRODUCTION) {
      res.sendStatus(res.statusCode)
    } else {
      res.status(res.statusCode).json(err)
    }
  } else if (res.headersSent) {
    res.sendStatus(res.statusCode).json({
      message: res.message
    })
  }
})

app.listen(port)

module.exports = app
