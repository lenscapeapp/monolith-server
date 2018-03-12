const Storage = require('@google-cloud/storage')

const PROJECT_ID = 'senior-project-192409'
const BUCKET_NAME = 'ske-senior-project'
const BUCKET_DOMAIN = 'https://storage.googleapis.com'

const storage = new Storage({ projectId: PROJECT_ID })
const bucket = storage.bucket(BUCKET_NAME)

async function storePhoto (buffer, path, contentType = 'image/jpeg') {
  let bucketFile = bucket.file(path)

  try {
    let saveResponse = await bucketFile.save(buffer)
    let setMetaResponse = await bucketFile.setMetadata({
      contentType
    })
    let makePublicResponse = await bucketFile.makePublic()
  } catch (err) {
    console.error(err)
  }

  return getBucketURL(path)
}

function getBucketURL (path) {
  return `${BUCKET_DOMAIN}/${BUCKET_NAME}/${path}`
}

async function upload (remotePath, bucketPath) {
  let options = {
    destination: bucketPath,
    contentType: 'image/jpg'
  }
  let [uploadedFile] = await bucket.upload(remotePath, options)
  let publicRes = await uploadedFile.makePublic()

  return getBucketURL(bucketPath)
}

module.exports = {
  storePhoto,
  getBucketURL,
  upload
}
