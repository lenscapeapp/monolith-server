const { CONTENT_TYPE_EXTENSION_MAP, ALLOWED_CONTENT_TYPE, PHOTO_SIZE } = require('../config/constants')
const Resize = require('../functions/resize')
const Bucket = require('../functions/bucket')

function encodePhoto (photo, suffix) {
  let isoTime = photo.createdAt.toISOString()
  let timestamp = isoTime.replace(/-|T|:|Z|\./g, '')

  return `${photo.owner_id}_${photo.id}_${timestamp}_${suffix}.${photo.extension}`
}

function photoFormatFilter (req, file, cb) {
  if (!ALLOWED_CONTENT_TYPE.includes(file.mimetype)) {
    let allowedFormat = Object.values(CONTENT_TYPE_EXTENSION_MAP).map(s => s.toUpperCase()).join('/')
    return cb(null, false, new Error(`Only ${allowedFormat} files are accepted`))
  }

  cb(null, true)
}

async function createProfilePictureBundle (file, photo) {
  let urls = {}
  for (let size in PHOTO_SIZE) {
    let width = PHOTO_SIZE[size]
    let filename = encodePhoto(photo, size.substring(0, 2))

    try {
      let { buffer } = await Resize.squareCrop(file, width)
      urls[size] = await Bucket.storePhoto(buffer, `uploads/${filename}`, file.mimetype)
    } catch (error) {
      console.error('functions/file.createPhotoBundle')
    }
  }
  console.log(Bucket)
  urls.original = await Bucket.storePhoto(file.buffer, `uploads/${encodePhoto(photo, 'og')}`)

  return urls
}

module.exports = {
  createProfilePictureBundle,
  encodePhoto,
  photoFormatFilter
}
