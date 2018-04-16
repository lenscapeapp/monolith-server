const logger = require('./logger')

let username = require('os').userInfo().username

module.exports = {
  development: {
    username,
    password: '1234',
    database: 'lenscape_dev',
    host: 'localhost',
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg)
  },
  production: {
    username: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    host: process.env.POSTGRES_DB_HOST,
    database: 'lenscape_prod',
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg)
  },
  test: {
    username: 'postgres',
    password: '',
    database: 'lenscape_test',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  }
}
