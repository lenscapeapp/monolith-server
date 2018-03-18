const BUCKET_BASEURL = 'https://bucket.lenscape.me'
const BUCKET_NAME = 'lenscape'

const DEFAULT_SECRET = 'secret'
const CONTENT_TYPE_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png'
}
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

module.exports = {
  ALLOWED_CONTENT_TYPE: Object.keys(CONTENT_TYPE_EXTENSION_MAP),
  BUCKET_BASEURL,
  BUCKET_NAME,
  CONTENT_TYPE_EXTENSION_MAP,
  DEFAULT_SECRET,
  GCLOUD_PROJECT_ID: 'lenscapeapp',
  IMAGINARY_BASEURL: IS_PRODUCTION ? 'http://imaginary:9000' : 'http://localhost:9000',
  PHOTO_SIZE: {
    'thumbnail': 400,
    'resized': 2000
  },
  PLACEHOLDER_PROFILE_URL: `${BUCKET_BASEURL}/placeholder/profile.jpg`,
  SECRET: process.env.APP_SECRET || DEFAULT_SECRET
}
