const Storage = require('@google-cloud/storage')

const { GCLOUD_PROJECT_ID, BUCKET_NAME, BUCKET_BASEURL } = require('../config/constants')

const storage = new Storage({ projectId: GCLOUD_PROJECT_ID })
const bucket = storage.bucket(BUCKET_NAME)

function getBucketURL (path) {
  return `${BUCKET_BASEURL}/${path}`
}

async function storePhoto (buffer, path, contentType = 'image/jpeg') {
  let bucketFile = bucket.file(path)

  try {
    await bucketFile.save(buffer)
    await bucketFile.setMetadata({
      contentType
    })
    await bucketFile.makePublic()
  } catch (err) {
    console.error('functions/bucket.storePhoto', err)
  }

  return getBucketURL(path)
}

async function upload (remotePath, bucketPath) {
  let options = {
    destination: bucketPath,
    contentType: 'image/jpg'
  }

  try {
    let [uploadedFile] = await bucket.upload(remotePath, options)
    await uploadedFile.makePublic()
  } catch (error) {
    console.error('functions/bucket.upload')
  }

  return getBucketURL(bucketPath)
}

module.exports = {
  getBucketURL,
  storePhoto,
  upload
}
