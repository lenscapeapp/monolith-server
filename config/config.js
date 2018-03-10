let username = require('os').userInfo().username

module.exports = {
  development: {
    username,
    password: '1234',
    database: 'lenscape_dev',
    host: 'localhost',
    dialect: 'postgres'
  },
  production: {
    username: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    host: process.env.POSTGRES_DB_HOST,
    database: 'lenscape_prod',
    dialect: 'postgres'
  }
}
