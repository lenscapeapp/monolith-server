'use strict'
module.exports = (sequelize, DataTypes) => {
  var like = sequelize.define('Like', {
    user_id: DataTypes.INTEGER,
    photo_id: DataTypes.INTEGER
  }, {})
  like.associate = function (models) {
  }
  return like
}
