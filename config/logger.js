const winston = require('winston')

const { LOG_LEVEL } = require('../config/constants')

const idx = (o, ...p) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : undefined, o)

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format((info, opts) => {
      if (info instanceof Error) {
        let formData = idx(info, 'options', 'formData')
        if (formData && formData.file === undefined) return info
        formData.file = formData.file.inspect()
      }
      return info
    })(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
})

module.exports = logger
