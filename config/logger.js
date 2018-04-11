const winston = require('winston')
const CircularJSON = require('circular-json')

const { LOG_LEVEL } = require('../config/constants')

function replaceBuffer (name, val) {
  if (val && val.type && val.type === 'Buffer' && val.data instanceof Array) {
    return '<Buffer>'
  }
  return val
}

const ReplaceBufferFormatter = winston.format((info, opts) => {
  let formData = info.options && info.options.formData
  if (formData && (formData.file instanceof Buffer)) {
    formData.file = formData.file.inspect()
  }
  return info
})

const CircularJsonFormatter = winston.format((info, opts) => {
  info[Symbol.for('message')] = CircularJSON.stringify(info, replaceBuffer)
  return info
})

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    ReplaceBufferFormatter(),
    winston.format.timestamp(),
    CircularJsonFormatter()
  ),
  transports: [new winston.transports.Console()]
  // transports: [new winston.transports.File({ filename: 'test.log' })]
})

module.exports = logger
