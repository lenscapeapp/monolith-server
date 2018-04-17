'use strict'

const { PLACEHOLDER_PROFILE_URL } = require('../config/constants')

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
    User.hasOne(models.LocalAuth, {
      foreignKey: 'user_id',
      constraints: false
    })
    User.hasOne(models.FacebookAuth, {
      foreignKey: 'user_id',
      constraints: false
    })
    User.hasMany(models.Photo, {
      foreignKey: 'owner_id'
    })
    User.hasOne(models.Photo, {
      as: 'CurrentProfilePhoto',
      foreignKey: 'current_profile_id'
    })
    User.belongsToMany(models.Photo, {
      through: {
        model: models.Like,
        unique: true
      },
      as: 'LikedPhotos',
      foreignKey: 'user_id'
    })
  }

  User.prototype.getProfile = async function () {
    let profile = this.get({ plain: true })

    let profilePhoto = await this.getCurrentProfilePhoto()
    profile.photo = profilePhoto ? profilePhoto.thumbnail : PLACEHOLDER_PROFILE_URL

    return profile
  }

  return User
}
