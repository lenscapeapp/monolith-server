'use strict'
module.exports = (sequelize, DataTypes) => {
  var Base = sequelize.define('Base', {
    unique_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDv4
    },
    name: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return Base
}
