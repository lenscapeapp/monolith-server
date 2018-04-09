const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const { sequelize } = require('../models')

chai.should()
chai.use(chaiHttp)

before((done) => {
  sequelize.sync().then(() => done())
})

after((done) => {
  sequelize.drop().then(() => done())
})

describe('Health check', () => {
  it('should return 200', (done) => {
    chai.request(server)
      .get('/')
      .then(res => {
        res.should.have.status(200)
        done()
      })
      .catch(err => done(err))
  })
})
