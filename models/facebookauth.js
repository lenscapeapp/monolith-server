'use strict'
module.exports = (sequelize, DataTypes) => {
  var FacebookAuth = sequelize.define('FacebookAuth', {
    facebook_id: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {})
  FacebookAuth.associate = function (models) {
    FacebookAuth.belongsTo(models.User, {
      foreignKey: 'user_id'
    })
  }
  return FacebookAuth
}
