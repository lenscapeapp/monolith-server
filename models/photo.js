'use strict'

const { PHOTO_SIZE, BUCKET_BASEURL } = require('../config/constants')
const File = require('../functions/file')
const Resize = require('../functions/resize')
const Bucket = require('../functions/bucket')

module.exports = (sequelize, DataTypes) => {
  var Photo = sequelize.define('Photo', {
    owner_id: DataTypes.INTEGER,
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
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {})
  Photo.associate = function (models) {
    Photo.belongsTo(models.User, {
      as: 'Owner',
      foreignKey: 'owner_id'
    })
    Photo.belongsTo(models.User, {
      as: 'CurrentProfile',
      foreignKey: 'current_profile_id'
    })
    Photo.belongsTo(models.LocationTag, {
      foreignKey: 'locationtag_id'
    })
  }

  Photo.prototype.isCurrentProfilePicture = async function () {
    let up = await this.getCurrentProfile()
    return up !== null
  }

  Photo.prototype.getUrls = function () {
    let sizes = Object.keys(PHOTO_SIZE)
    let baseObj = {
      original: `${BUCKET_BASEURL}/uploads/${File.encodePhoto(this, 'og')}`
    }

    return sizes.reduce((accumulator, e) => {
      accumulator[e] = `${BUCKET_BASEURL}/uploads/${File.encodePhoto(this, e.substring(0, 2))}`
      return accumulator
    }, baseObj)
  }

  Photo.prototype.upload = async function (file, contentType) {
    let sizes = Object.keys(PHOTO_SIZE)
    let urls = await Promise.all(sizes.map(async (size) => {
      let width = PHOTO_SIZE[size]
      let resized = null

      if (this.type === 'profile') {
        resized = await Resize.squareCrop(file, width)
      } else if (this.type === 'photo') {
        resized = await Resize.keepRatio(file, width)
      }
      console.log(this)
      let url = await Bucket.storePhoto(resized.buffer, `uploads/${File.encodePhoto(this, size.substring(0, 2))}`, contentType)

      return url
    }))

    let urlMap = {}
    sizes.forEach((size, index) => {
      urlMap[size] = urls[index]
    })

    let originalUrl = await Bucket.storePhoto(file.buffer, `uploads/${File.encodePhoto(this, 'og')}`, contentType)
    urlMap.original = originalUrl

    return urlMap
  }

  return Photo
}
