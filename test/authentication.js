const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')

const server = require('../server')
const { sequelize } = require('../models')

const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp)

describe('Authentication', () => {
  describe('Register', () => {
    it('should be able to register without profile picture', done => {
      let info = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: faker.internet.email()
      }
      chai.request(server)
        .post('/register')
        .send({
          password: faker.internet.password(),
          ...info
        })
        .end((err, res) => {
          if (err) throw err
          should.exist(res.body.user)
          expect(res.body.user).to.include(info)

          let photoUrl = new URL(res.body.user.picture)
          chai.request(photoUrl.origin)
            .get(photoUrl.pathname)
            .end((err, res) => {
              if (err) throw err
              res.should.have.status(200)
              done()
            })
        })
    })

    it('should be able to register with profile picture', done => {
      let info = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: faker.internet.email()
      }

      chai.request(server)
        .post('/register')
        .attach('picture', fs.readFileSync(path.join(__dirname, 'materials', 'profile.jpg')), 'profile.jpg')
        .field('firstname', info.firstname)
        .field('lastname', info.lastname)
        .field('email', info.email)
        .field('password', faker.internet.password())
        .end((err, res) => {
          if (err) throw err
          should.exist(res.body.user)
          expect(res.body.user).to.include(info)

          let photoUrl = new URL(res.body.user.picture)
          chai.request(photoUrl.origin)
            .get(photoUrl.pathname)
            .end((err, res) => {
              if (err) throw err
              res.should.have.status(200)
              done()
            })
        })
    }).timeout(10e3)
  })

  it('Local Login')
  it('Facebook Login')
})
