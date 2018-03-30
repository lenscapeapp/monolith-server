'use strict'

let ups = [
  function locationtag_id_up (queryInterface, Sequelize) {
    console.log('Add foreign key')
    return queryInterface.addColumn('Photos', 'locationtag_id', {
      type: Sequelize.INTEGER,
      references: { model: 'LocationTags', key: 'id' }
    })
  },
  async function migrate_to_locationtag (queryInterface, Sequelize) {
    console.log('Migrate location details')
    let [locations, result] = await queryInterface.sequelize.query(`
      SELECT DISTINCT lat, long FROM "Photos" WHERE lat IS NOT NULL AND long IS NOT NULL
    `)
    console.log(locations)
    return Promise.all(locations.map(row => {
      return queryInterface.sequelize.query(`
        INSERT INTO "LocationTags" (name, lat, long, "createdAt", "updatedAt") VALUES ('location', ${row.lat}, ${row.long}, now(), now())
      `
      )
    }))
  },
  async function update_locationtag_id (queryInterface, Sequelize) {
    console.log('Use LocationTags')
    let [locations, result] = await queryInterface.sequelize.query(`
      SELECT DISTINCT lat, long, id FROM "LocationTags"
    `)
    return Promise.all(locations.map(row => queryInterface.sequelize.query(`
      UPDATE "Photos"
      SET "locationtag_id" = ${row.id}, "updatedAt" = now()
      WHERE lat = ${row.lat} and long = ${row.long}
    `)))
  },
  function remove_columns (queryInterface, Sequelize) {
    console.log('Remove columns')
    return Promise.all([
      queryInterface.removeColumn('Photos', 'lat'),
      queryInterface.removeColumn('Photos', 'long')
    ])
  }
]

let downs = [
  function add_columns (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('Photos', 'lat', {
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('Photos', 'long', {
        type: Sequelize.DOUBLE
      })
    ])
  },
  async function restore_values (queryInterface, Sequelize) {
    let [locations, result] = await queryInterface.sequelize.query(`
      SELECT id, lat, long FROM "LocationTags"
    `)
    return Promise.all(locations.map(row => queryInterface.sequelize.query(`
      UPDATE "Photos"
      SET "long" = ${row.long}, "lat" = ${row.lat}
      WHERE locationtag_id = ${row.id}
    `)))
  },
  function remove_columns (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Photos', 'locationtag_id')
  }
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let latest
    for (let func of ups) {
      latest = await func(queryInterface, Sequelize)
    }
    return latest
  },

  down: async (queryInterface, Sequelize) => {
    let latest
    for (let func of downs) {
      latest = await func(queryInterface, Sequelize)
    }
    return latest
  }
}
