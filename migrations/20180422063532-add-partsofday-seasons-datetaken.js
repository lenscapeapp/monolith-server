import { query } from 'express-validator/check';

'use strict'

const { PARTS_OF_DAY, SEASONS } = require('../config/constants')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Photos', 'part_of_day', {
        type: Sequelize.ENUM(...PARTS_OF_DAY)
      }),
      queryInterface.addColumn('Photos', 'season', {
        type: Sequelize.ENUM(...SEASONS)
      }),
      queryInterface.addColumn('Photos', 'date_taken', {
        type: Sequelize.DATEONLY
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Photos', 'part_of_day'),
      queryInterface.removeColumn('Photos', 'season'),
      queryInterface.removeColumn('Photos', 'date_taken')
    ])
  }
}
