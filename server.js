const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

const router = require('./routes')

const app = new Koa()

const environment = process.env['ENV'] || 'development'

app.use(cors())
app.use(bodyParser())

/* Error Handling */
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.status = error.status || 500

    if (environment !== 'development') {
      ctx.body = {
        message: 'Oops! Something went wrong.'
      }
    } else {
      ctx.body = {
        message: error.message,
        stacktrace: error.stack
      }
    }

    ctx.app.emit('error', error, ctx)
  }
})

app.on('error', function (err) {
  console.log(err)
})

router.configRoute(app)

app.listen(8000)
