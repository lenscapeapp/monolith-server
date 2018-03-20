'use strict'

const { PHOTO_SIZE } = require('../config/constants')
const { File } = require('../functions')

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
    },
    current_profile_id: {
      type: DataTypes.INTEGER,
      validate: {
        isProfileType () {
          if (this.type !== 'profile') {
            throw new Error('Must be profile type!')
          }
        }
      }
    }
  }, {})
  Photo.associate = function (models) {
    Photo.belongsTo(models.User, {
      as: 'owner',
      foreignKey: 'owner_id'
    })
    Photo.belongsTo(models.User, {
      as: 'currentProfile',
      foreignKey: 'current_profile_id'
    })
  }

  Photo.prototype.isCurrentProfilePicture = async function () {
    let up = await this.getCurrentProfile()
    return up !== null
  }

  Photo.getUrls = async function () {
    let size = Object.keys(PHOTO_SIZE)

    return size.reduce((accumulator, e) => {
      accumulator[e] = File.encodePhoto(this, e.substring(0, 2))
    }, {})
  }

  return Photo
}
