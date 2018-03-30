process.env.NODE_ENV = 'test'
process.env.ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const { sequelize } = require('../models')

chai.should()
chai.use(chaiHttp)

describe('Health check', () => {
  before(() => {
    sequelize.sync()
  })

  it('should return 200', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        if (err) throw err
        res.should.have.status(200)
        done()
      })
  })

  it('should be able to register', (done) => {
    chai.request(server)
      .post('/register')
      .type('form')
      .send({
        firstname: 'chin',
        lastname: 'nonae',
        email: 'chinnonae@lenscape.me',
        password: '12345678'
      })
      .end((err, res) => {
        if (err) throw err
        console.log(res)
        res.should.have.status(200)
        done()
      })
  })
})
