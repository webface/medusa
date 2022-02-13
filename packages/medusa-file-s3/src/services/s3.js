import fs from "fs"
import path from 'path'
import aws from "aws-sdk"
import { FileService } from "medusa-interfaces"

class S3Service extends FileService {
  constructor({}, options) {
    super()

    this.bucket_ = options.bucket
    this.s3Url_ = options.s3_url
    this.accessKeyId_ = options.access_key_id
    this.secretAccessKey_ = options.secret_access_key
    this.region_ = options.region
    
    this.bucketPrivate_ = options.bucket_private
    this.s3UrlPrivate_ = options.s3_private_url
    this.regionPrivate_ = options.region_private

    this.endpoint_ = options.endpoint
  }

  upload_(params, region) {
    aws.config.setPromisesDependency()
    aws.config.update({
      accessKeyId: this.accessKeyId_,
      secretAccessKey: this.secretAccessKey_,
      region: region,
      endpoint: this.endpoint_,
    })

    const s3 = new aws.S3()
   
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err)
          return
        }

        resolve({ url: data.Location })
      })
    })
  }

  delete_(params, region) {
    aws.config.setPromisesDependency()
    aws.config.update({
      accessKeyId: this.accessKeyId_,
      secretAccessKey: this.secretAccessKey_,
      region: region,
      endpoint: this.endpoint_,
    })

    const s3 = new aws.S3()
    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    })
  }

  async download_(params, region) {
    aws.config.setPromisesDependency()
    aws.config.update({
      accessKeyId: this.accessKeyId_,
      secretAccessKey: this.secretAccessKey_,
      region: region,
      endpoint: this.endpoint_,
    })

    const s3 = new aws.S3()
    const file = await s3.getObject(params).promise()
    return {
     data: file.Body,
     mimetype: file.ContentType
    }
    const file = fs.createWriteStream(path.join(__dirname, params.Key));
    const file = fs.createWriteStream(`/tmp/${params.Key}`);

    const s3 = new aws.S3()
    return new Promise((resolve, reject) => {
      const pipe = s3.getObject(params).createReadStream().pipe(file);
      pipe.on('error', reject);
      pipe.on('close', resolve);
    })
  }

  upload(file){
    var params = {
      ACL: "public-read",
      Bucket: this.bucket_,
      Body: fs.createReadStream(file.path),
      Key: `${file.originalname}`,
    }
    var region  = this.region_
    return this.upload_(params, region)
  }

  delete(file) {

    var region  = this.region_
    var params = {
      Bucket: this.bucket_,
      Key: `${file}`,
    }

    return this.delete_(params, region)
  }

  uploadPrivate(file){
    var params = {
      Bucket: this.bucketPrivate_,
      Body: fs.createReadStream(file.path),
      Key: `${file.originalname}`,
    }
    var region  = this.regionPrivate_
    return this.upload_(params, region)
  }

  deletePrivate(file) {

    var region  = this.regionPrivate_
    var params = {
      Bucket: this.bucketPrivate_,
      Key: `${file}`,
    }

    return this.delete_(params, region)
  }

  downloadPrivate(file) {

    var region  = this.regionPrivate_
    var params = {
      Bucket: this.bucketPrivate_,
      Key: `${file}`,
    }

    return this.download_(params, region)
  }
  
}

export default S3Service
