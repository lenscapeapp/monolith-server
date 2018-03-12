const BUCKET_BASEURL = 'https://bucket.lenscape.me'
const BUCKET_NAME = 'ske-senior-project'

const DEFAULT_SECRET = 'secret'
const CONTENT_TYPE_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png'
}

module.exports = {
  ALLOWED_CONTENT_TYPE: Object.keys(CONTENT_TYPE_EXTENSION_MAP),
  BUCKET_BASEURL,
  BUCKET_NAME,
  CONTENT_TYPE_EXTENSION_MAP,
  DEFAULT_SECRET,
  GCLOUD_PROJECT_ID: 'senior-project-192409',
  IMAGINARY_BASEURL: 'http://localhost:9000',
  PHOTO_SIZE: {
    'thumbnail': 400,
    'resized': 2000
  },
  PLACEHOLDER_PROFILE_URL: `${BUCKET_BASEURL}/${BUCKET_NAME}/placeholder/profile.jpg`,
  SECRET: process.env.APP_SECRET || DEFAULT_SECRET
}
