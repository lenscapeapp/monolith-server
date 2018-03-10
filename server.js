const express = require('express')
const bodyParser = require('body-parser')

const rootRouter = require('./routes')

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

app.listen(port)
