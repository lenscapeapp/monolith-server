'use strict'
module.exports = (sequelize, DataTypes) => {
  var LocalAuth = sequelize.define('LocalAuth', {
    user_id: DataTypes.INTEGER,
    username: {
      type: DataTypes.STRING(20),
      unique: true
    },
    hpassword: DataTypes.STRING
  }, {})
  LocalAuth.associate = function (models) {
    LocalAuth.belongsTo(models.User, {
      foreignKey: 'user_id'
    })
  }
  return LocalAuth
}
