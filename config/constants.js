const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const IS_TEST = process.env.NODE_ENV === 'test'

const BUCKET_BASEURL = IS_PRODUCTION ? 'https://bucket.lenscape.me' : ('https://storage.googleapis.com/' + (IS_TEST ? 'lenscape_test' : 'lenscape_dev'))
const BUCKET_NAME = IS_PRODUCTION ? 'lenscape' : (IS_TEST ? 'lenscape_test' : 'lenscape_dev')

const DEFAULT_SECRET = 'secret'
const CONTENT_TYPE_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png'
}

module.exports = {
  ALLOWED_CONTENT_TYPE: Object.keys(CONTENT_TYPE_EXTENSION_MAP),
  API_KEY: process.env.API_KEY,
  BUCKET_BASEURL,
  BUCKET_NAME,
  CONTENT_TYPE_EXTENSION_MAP,
  DEBUG: process.env.DEBUG_MODE === 'true',
  DEFAULT_NEARBY_RADIUS: 5,
  DEFAULT_PAGE_SIZE: 25,
  DEFAULT_QUERY_RADIUS: 5,
  DEFAULT_SECRET,
  GCLOUD_PROJECT_ID: 'lenscapeapp',
  IMAGINARY_BASEURL: IS_PRODUCTION ? 'http://imaginary:9000' : 'http://localhost:9000',
  IS_NEAR_DISTANCE: 2,
  IS_PRODUCTION,
  IS_TEST,
  LOG_LEVEL: process.env.LOG_LEVEL || 'silly',
  PARTS_OF_DAY: ['Dawn', 'Early Morning', 'Morning', 'Noon', 'Afternoon', 'Evening', 'Night', 'Midnight'],
  PHOTO_SIZE: {
    'thumbnail': 400,
    'resized': 2000
  },
  PLACEHOLDER_PROFILE_URL: `${BUCKET_BASEURL}/placeholder/profile.jpg`,
  SEASONS: ['Winter', 'Spring', 'Summer', 'Autumn'],
  SECRET: process.env.APP_SECRET || DEFAULT_SECRET
}
