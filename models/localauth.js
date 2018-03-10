'use strict'
module.exports = (sequelize, DataTypes) => {
  var LocalAuth = sequelize.define('LocalAuth', {
    user_id: DataTypes.INTEGER,
    hpassword: DataTypes.STRING
  }, {})
  LocalAuth.associate = function (models) {
    LocalAuth.belongsTo(models.User, {
      foreignKey: 'user_id'
    })
  }
  return LocalAuth
}
