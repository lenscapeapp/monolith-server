const GeoPoint = require('geopoint')

function random (min, max) {
  let diff = (max - min)
  let random = Math.random() * diff
  return min + random
}

module.exports = {
  address: {
    latlong (center, distance) {
      let [swBound, neBound] = center.boundingCoordinates(distance, 0, true)
      let lat = random(swBound.latitude(), neBound.latitude())
      let long = random(swBound.longitude(), neBound.longitude())

      return `${lat}, ${long}`
    }
  },
  random
}
