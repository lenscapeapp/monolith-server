'use strict'

const gmap = require('../functions/gmap')

function down (queryInterface, Sequelize) {
  return queryInterface.removeColumn('LocationTags', 'address')
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('LocationTags', 'address', {
        type: Sequelize.STRING
      })
      let locations = (await queryInterface.sequelize.query('SELECT DISTINCT "lat", "long" FROM "LocationTags"'))[0]
      return Promise.all(locations.map(location =>
        gmap.reverseGeocode({ latlng: [location.lat, location.long], language: 'en' }).asPromise()
          .then(data => queryInterface.sequelize.query(
            `UPDATE "LocationTags"
            SET address = '${data.json.results[0].formatted_address}'
            where "lat" = ${location.lat} and "long" = ${location.long}`
          ))
      ))
    } catch (error) {
      down(queryInterface, Sequelize)
      throw error
    }
  },

  down: (queryInterface, Sequelize) => {
    return down(queryInterface, Sequelize)
  }
}
