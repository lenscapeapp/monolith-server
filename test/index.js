process.env.NODE_ENV = 'test'
process.env.ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')

chai.should()
chai.use(chaiHttp)

describe('Health check', () => {
  it('should return 200', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        if (err) throw err
        res.should.have.status(200)
        done()
      })
  })
})
