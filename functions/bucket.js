const Storage = require('@google-cloud/storage')
const path = require('path')

const { GCLOUD_PROJECT_ID, BUCKET_NAME, BUCKET_BASEURL, IS_TEST } = require('../config/constants')

const storage = new Storage({
  projectId: GCLOUD_PROJECT_ID,
  keyFilename: IS_TEST ? path.join(__dirname, '../gcloud-client-secret.json') : undefined
})
const bucket = storage.bucket(BUCKET_NAME)

function getBucketURL (path) {
  return `${BUCKET_BASEURL}/${path}`
}

async function storePhoto (buffer, path, contentType = 'image/jpeg') {
  let bucketFile = bucket.file(path)

  await bucketFile.save(buffer)
  await bucketFile.setMetadata({
    contentType
  })
  await bucketFile.makePublic()

  return getBucketURL(path)
}

async function upload (remotePath, bucketPath) {
  let options = {
    destination: bucketPath,
    contentType: 'image/jpg'
  }

  let [uploadedFile] = await bucket.upload(remotePath, options)
  await uploadedFile.makePublic()

  return getBucketURL(bucketPath)
}

module.exports = {
  getBucketURL,
  storePhoto,
  upload
}
