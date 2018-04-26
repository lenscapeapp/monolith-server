'use strict'

const gmap = require('../functions/gmap')

module.exports = (sequelize, DataTypes) => {
  var LocationTag = sequelize.define('LocationTag', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    long: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    google_place_id: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING
    }
  }, {})
  LocationTag.associate = function (models) {
    LocationTag.hasMany(models.Photo, {
      foreignKey: 'locationtag_id'
    })
  }

  LocationTag.addHook('beforeCreate', async locationtag => {
    let request = await gmap.reverseGeocode({ latlng: [locationtag.lat, locationtag.long] }).asPromise()
    locationtag.address = request.json.results[0].formatted_address
  })

  return LocationTag
}
