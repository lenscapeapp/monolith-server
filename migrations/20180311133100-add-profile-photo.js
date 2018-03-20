'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Photos', 'current_profile_id', {
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'current_profile_id')
  }
}
