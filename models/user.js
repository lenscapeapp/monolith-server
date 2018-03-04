'use strict'
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    unique_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING
  }, {})

  User.associate = function (models) {
    User.hasMany(models.Photo, {
      foreignKey: 'owner_id',
      constraints: false
    })
    User.hasOne(models.LocalAuth, {
      foreignKey: 'user_id',
      constraints: false
    })
  }

  return User
}