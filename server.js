const express = require('express')
const bodyParser = require('body-parser')

const rootRouter = require('./routes')

const port = 8080

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  console.log(req.originalUrl)
  next()
})
app.use('/', rootRouter)

app.listen(port)
