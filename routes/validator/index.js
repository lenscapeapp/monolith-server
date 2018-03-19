const { Router } = require('express')
const { validationResult } = require('express-validator/check')

const authRouter = require('./auth')

const router = new Router()

router.use('/', authRouter)

router.use('*', (req, res, next) => {
  const result = validationResult(req)

  if (result.isEmpty()) { return next() }

  let invalids = result.mapped()
  let errors = []
  for (let field in invalids) {
    errors.push({
      field,
      message: invalids[field].msg
    })
  }

  res.status(400).json({
    message: '',
    invalid_fields: errors
  })
})

module.exports = router
