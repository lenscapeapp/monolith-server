const { param } = require('express-validator/check')

const { User } = require('../../models')

module.exports = {

  getOtherUser: [
    param('user_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('user_id must be an integer greater than 0')
      .toInt()
      .custom(async value => {
        let user = await User.findById(value)
        if (!user) throw new Error(`user id#${value} does not exist`)
        return user
      })
  ]
}