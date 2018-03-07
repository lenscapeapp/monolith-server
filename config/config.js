let username = require('os').userInfo().username

module.exports = {
  production: {
    username: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    host: process.env.POSTGRES_DB_HOST,
    database: 'lenscape',
    dialect: 'postgres'
  },
  development: {
    username,
    password: '1234',
    database: 'lenscape_dev',
    host: 'localhost',
    dialect: 'postgres'
  }
}
