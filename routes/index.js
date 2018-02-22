const { Router } = require('express')

const authRouter = require('./auth')

const router = new Router()

function falseAsyncCall () {
  return new Promise(resolve => {
    setTimeout(() => resolve('False value'), 500)
  }).catch(error => console.log(error))
}

router.use('/', authRouter)

router.all('*', async (req, res) => {
  const start = Date.now()
  const result = await falseAsyncCall()
  res.send(`Hello World ${Date.now() - start}`)
  return result
})

module.exports = router
