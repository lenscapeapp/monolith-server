const request = require('request-promise-native')
const querystring = require('querystring')
const sizeOf = require('image-size')

const { IMAGINARY_BASEURL } = require('../config/constants')

async function keepRatio (file, width) {
  let dimensions = sizeOf(file.buffer)
  let isLandscape = dimensions.width > dimensions.height
  let queryObj = { nocrop: true }

  if (isLandscape) {
    queryObj.width = width
  } else {
    queryObj.height = width
  }

  let formData = { file: file.buffer }
  let query = querystring.stringify(queryObj)
  let baseUri = `${IMAGINARY_BASEURL}/resize`

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
  let baseUrl = `${IMAGINARY_BASEURL}/pipeline`
  let extractBuffer

  extractBuffer = await request.post({
    uri: `${baseUrl}?${query}`,
    formData,
    encoding: null
  })

  return {
    buffer: extractBuffer
  }
}

module.exports = {
  keepRatio,
  squareCrop
}
