'use strict'
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
    }
  }, {})
  LocationTag.associate = function (models) {
    LocationTag.hasMany(models.Photo, {
      foreignKey: 'locationtag_id'
    })
  }
  return LocationTag
}
