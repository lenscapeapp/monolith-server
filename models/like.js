'use strict'
module.exports = (sequelize, DataTypes) => {
  var Like = sequelize.define('Like', {
    user_id: DataTypes.INTEGER,
    photo_id: DataTypes.INTEGER
  }, {})

  Like.associate = function (models) {

  }

  return Like
}
