const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const fs = require('fs')
const GeoPoint = require('geopoint')
const gmap = require('../functions/gmap')
const path = require('path')
const { URL } = require('url')

const cfaker = require('./cfaker')
const server = require('../server')

const should = chai.should()
const expect = chai.expect
chai.use(chaiHttp)

describe('Upload photo', () => {

  let usertoken = ''
  let user = null

  before(done => {
    let userInfo = {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    }
    chai.request(server)
      .post('/register')
      .send(userInfo)
      .then(res => {
        usertoken = res.body.token
        user = res.body.user
        done()
      })
      .catch(err => done(err))
  })

  it('should upload photo sucessfully', done => {
    let info = {
      location: new GeoPoint(13.846209, 100.568662),
      imageName: faker.address.streetName(),
      locationName: faker.address.streetAddress()
    }

    chai.request(server)
      .post('/photo')
      .set('Authorization', `Bearer ${usertoken}`)
      .attach('picture', fs.readFileSync(path.join(__dirname, 'materials', 'photo1.jpg')), 'photo.jpg')
      .field('image_name', info.imageName)
      .field('location_name', info.locationName)
      .field('latlong', `${info.location.latitude()}, ${info.location.longitude()}`)
      .then(res => {
        res.should.have.status(200)

        // image
        should.exist(res.body.id)
        expect(res.body.name).to.equals(info.imageName)
        expect(res.body.number_of_likes).to.be.a('number')
        expect(res.body.is_owner).to.be.a('boolean')

        // location
        expect(res.body.location.name).to.equals(info.locationName)
        expect(res.body.location.latitude).to.equals(info.location.latitude())
        expect(res.body.location.longitude).to.equals(info.location.longitude())
        expect(res.body.location.distance).to.be.a('number')

        // owner
        should.exist(res.body.owner)

        done()
      })
      .catch(err => done(err))
  }).timeout(30e3)

  it('should upload photo with google place successfully', done => {
    let info = {
      placeId: 'ChIJZ__jS-ec4jARzA2pigUpDXQ',
      imageName: faker.address.streetName()
    }
    
    chai.request(server)
      .post('/photo')
      .set('Authorization', `Bearer ${usertoken}`)
      .attach('picture', fs.readFileSync(path.join(__dirname, 'materials', 'photo2.jpg')), 'photo.jpg')
      .field('image_name', info.imageName)
      .field('gplace_id', info.placeId)
      .then(res => {
        res.should.have.status(200)

        // image
        should.exist(res.body.id)
        expect(res.body.name).to.equals(info.imageName)
        expect(res.body.number_of_likes).to.be.a('number')
        expect(res.body.is_owner).to.be.a('boolean')

        // owner
        should.exist(res.body.owner)

        return gmap.place({ placeid: info.placeId }).asPromise()
          .then(res2 => {
            let place = res2.json.result
            expect(res.body.location.name).to.equals(place.name)
            expect(res.body.location.latitude).to.equals(place.geometry.location.lat)
            expect(res.body.location.longitude).to.equals(place.geometry.location.lng)

            done()
          })
      })
      .catch(err => done(err))
  }).timeout(30e3)
})
