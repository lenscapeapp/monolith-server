'use strict'
module.exports = (sequelize, DataTypes) => {
  var Photo = sequelize.define('Photo', {
    unique_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDv4
    },
    photo_url: DataTypes.STRING(2083),
    owner_id: DataTypes.INTEGER
  }, {})
  Photo.associate = function (models) {
    Photo.belongsTo(models.User, {
      foreignKey: 'id',
      constraints: false,
      as: 'owner'
    })
  }
  return Photo
}
