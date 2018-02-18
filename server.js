const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

const router = require('./routes')
const models = require('./models')

const app = new Koa()

app.use(cors())
app.use(bodyParser())

router.configRoute(app)

app.listen(8000)
