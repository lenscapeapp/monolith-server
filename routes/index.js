const Router = require('koa-router')

const router = new Router()

router.all('/echo', (ctx, next) => {
  ctx.body = {
    body: ctx.request.body,
    headers: ctx.request.header
  }
})

router.get('/', (ctx, next) => {
  ctx.body = 'Hello world'
})

module.exports = {
  configRoute: (koaApp) => {
    koaApp
      .use(router.routes())
      .use(router.allowedMethods())

    return koaApp
  }
}
