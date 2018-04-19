const GeoPoint = require('geopoint')

const idx = (o, ...p) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : undefined, o)

class GooglePlace {
  constructor (dataObject) {
    let location = idx(dataObject, 'geometry', 'location')
    this.location = location ? new GeoPoint(location.lat, location.lng) : undefined

    this.name = dataObject.name
    this.gplace_id = dataObject.place_id
    this.address = dataObject.formatted_address
  }
}

module.exports = GooglePlace
