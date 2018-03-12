
function encodePhoto (photo) {
  let isoTime = photo.createdAt.toISOString()
  let timestamp = isoTime.replace(/-|T|:|Z|\./g, '')

  return `${photo.owner_id}_${photo.id}_${timestamp}.${photo.extension}`
}

module.exports = {
  encodePhoto
}
