const fs = require('fs')

let filenames = fs.readdirSync(__dirname)
let exportObj = {}

for (let filename of filenames) {
  if (filename === 'index.js') continue

  if (filename.endsWith('.js')) {
    let extenstionStart = filename.lastIndexOf('.')
    let name = filename.charAt(0).toUpperCase() + filename.substring(1, extenstionStart)
    exportObj[name] = require(`./${filename}`)
  }
}

module.exports = exportObj
