const GoogleMaps = require('@google/maps')
const { API_KEY } = require('../config/constants')

const gmapClient = GoogleMaps.createClient({
  key: API_KEY,
  Promise: Promise
})

module.exports = gmapClient
