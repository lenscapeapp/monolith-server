'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Photos', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Photos', 'name')
  }
}
