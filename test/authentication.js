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
        .then(res => {
          should.exist(res.body.user)
          expect(res.body.user).to.include(info)

          let photoUrl = new URL(res.body.user.picture)
          return chai.request(photoUrl.origin)
            .get(photoUrl.pathname)
        })
        .then(res => {
          res.should.have.status(200)
          done()
        })
        .catch(err => done(err))
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
        .then(res => {
          should.exist(res.body.user)
          expect(res.body.user).to.include(info)

          let photoUrl = new URL(res.body.user.picture)
          return chai.request(photoUrl.origin)
            .get(photoUrl.pathname)
        })
        .then(res => {
          res.should.have.status(200)
          done()
        })
        .catch(err => done(err))
    }).timeout(30e3)
  })

  describe('Login with Local method', () => {
    describe('With correct information', () => {
      it('should have profile photo', done => {
        let info = {
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          email: faker.internet.email()
        }
        let password = faker.internet.password()
        chai.request(server)
          .post('/register')
          .attach('picture', fs.readFileSync(path.join(__dirname, 'materials', 'profile.jpg')), 'profile.jpg')
          .field('firstname', info.firstname)
          .field('lastname', info.lastname)
          .field('email', info.email)
          .field('password', password)
          .then(res => {
            res.should.have.status(200)
            return chai.request(server)
              .post('/login/local')
              .send({
                email: info.email,
                password
              })
          })
          .then(res => {
            res.should.have.status(200)
            done()
          })
          .catch(err => done(err))
      }).timeout(30e3)

      it('should have placeholder photo', done => {
        let info = {
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          email: faker.internet.email()
        }
        let password = faker.internet.password()
        chai.request(server)
          .post('/register')
          .send({
            password,
            ...info
          })
          .then(res => {
            res.should.have.status(200)
            return chai.request(server)
              .post('/login/local')
              .send({
                email: info.email,
                password
              })
          })
          .then(res => {
            res.should.have.status(200)
            done()
          })
          .catch(err => done(err))
      })
    })
  })

  it('Facebook Login')
})
