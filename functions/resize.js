const request = require('request-promise-native')
const querystring = require('querystring')
const sizeOf = require('image-size')

async function keepRatio (file, width) {
  let formData = { file: file.buffer }
  let query = querystring.stringify({ width, nocrop: true })
  let baseUri = 'http://localhost:9000/resize'

  let resizedBuffer = await request.post({
    uri: `${baseUri}?${query}`,
    formData,
    encoding: null
  })

  return {
    buffer: resizedBuffer
  }
}

async function squareCrop (file, width) {
  let dimensions = sizeOf(file.buffer)
  let isLandscape = dimensions.width > dimensions.height
  let queryObj = null
  if (isLandscape) {
    queryObj = {
      top: 0,
      left: (dimensions.width - dimensions.height) / 2,
      areaheight: dimensions.height,
      areawidth: dimensions.height
    }
  } else {
    queryObj = {
      left: 0,
      top: (dimensions.height - dimensions.width) / 2,
      areaheight: dimensions.width,
      areawidth: dimensions.width
    }
  }

  let ops = [
    {
      operation: 'extract',
      params: queryObj
    }, {
      operation: 'resize',
      params: {
        width,
        nocrop: true
      }
    }
  ]

  let formData = { file: file.buffer }
  let query = querystring.stringify({ operations: JSON.stringify(ops) })
  let baseUrl = 'http://localhost:9000/pipeline'
  let extractBuffer
  try {
    extractBuffer = await request.post({
      uri: `${baseUrl}?${query}`,
      formData,
      encoding: null
    })
  } catch (error) {
  }
  return {
    buffer: extractBuffer
  }
}

module.exports = {
  keepRatio,
  squareCrop
}
