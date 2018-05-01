const FCM = require('fcm-node')
const { Router } = require('express')

const getResponse = require('../response-scheme')
const { User, Photo, sequelize, sequelize: { Op } } = require('../models')
const { FCM_KEY, SERVER_URL } = require('../config/constants')

const router = new Router()
const fcm = new FCM(FCM_KEY)
const TOPIC = 'tests'

router.route('/notify')
  .get(
    async (req, res, next) => {
      let now = new Date()

      let photo = await Photo.scope('withOwner', 'withLocation').findOne({
        attributes: {
          include: [[sequelize.fn('count', sequelize.col('*')), 'likes_count']],
        },
        where: {
          type: 'photo'
        },
        include: [{
          association: Photo.associations.LikedUsers,
          through: {
            where: {
              createdAt: {
                [Op.gte]: new Date(now - 24 * 60 * 60 * 1000)
              }
            }
          },
          required: true
        }],
        group: 'Photo.id'
      })

      let body = {
        to: '/topics/' + TOPIC,
        priority: 'high',
        data: {
          image_id: photo.id
        },
        notification: {
          body: 'Take a look at our photo of the day',
          subtitle: 'Photo of the day',
          badge: 0,
          sound: 'default'
        }
      }

      fcm.send(body, (err, response) => {
        if (err) return next(err)
        res.send(response)
      })
    }
  )

module.exports = router
