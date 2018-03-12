'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Photos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      owner_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' }
      },
      lat: {
        type: Sequelize.DOUBLE
      },
      long: {
        type: Sequelize.DOUBLE
      },
      type: {
        type: Sequelize.ENUM('profile', 'photo'),
        allowNull: false
      },
      extension: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Photos')
  }
}
