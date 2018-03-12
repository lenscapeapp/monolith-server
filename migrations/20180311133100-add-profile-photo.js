'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'picture', {
      type: Sequelize.INTEGER,
      references: { model: 'Photos', key: 'id' }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'picture')
  }
}
