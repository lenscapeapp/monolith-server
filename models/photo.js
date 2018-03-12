'use strict'
module.exports = (sequelize, DataTypes) => {
  var Photo = sequelize.define('Photo', {
    owner_id: DataTypes.INTEGER,
    lat: DataTypes.DOUBLE,
    long: DataTypes.DOUBLE,
    type: {
      type: DataTypes.ENUM('profile', 'photo'),
      allowNull: false
    },
    extension: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {})
  Photo.associate = function (models) {
    Photo.belongsTo(models.User, {
      foreignKey: 'owner_id'
    })
  }
  return Photo
}
