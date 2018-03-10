'use strict'
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      },
      unique: true
    }
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
