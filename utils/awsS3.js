const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const credentials = require('../config/aws-credentials');

function upload() {
    aws.config.update({
        accessKeyId: credentials.s3.accessKeyId,
        secretAccessKey: credentials.s3.secretAccessKey,
        // region: 'us-east-1'
    });

    const s3 = new aws.S3();
    const upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: credentials.s3.bucket,
            acl: 'public-read',
            metadata: function (req, file, cb) {
                cb(null, {fieldName: file.fieldname});
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString())
            }
        })
    })

    const singleUpload = upload.single('image')
    return singleUpload;
}

function multiUpload() {
    aws.config.update({
        accessKeyId: credentials.s3.accessKeyId,
        secretAccessKey: credentials.s3.secretAccessKey,
        // region: 'us-east-1'
    });

    const s3 = new aws.S3();
    const upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: credentials.s3.bucket,
            acl: 'public-read',
            metadata: function (req, files, cb) {
                cb(null, {fieldName: files.fieldname});
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString())
            }
        })
    })

    const multiUpload = upload.array('image', 5)
    return multiUpload;
}

exports.upload = upload;
exports.multiUpload = multiUpload;