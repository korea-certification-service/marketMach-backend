/**
 * AWS S3 파일 업로드 모듈
 * 작성자 : Chef Kim
 * 작성일 : 2019-11-20
 */
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const credentials = require('../../../config/aws-credentials');

//단일 파일 업로드 함수 - 최대 5개
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

//다중 파일 업로드 함수
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
                cb(null, {fieldName: files.fieldname + '-' + Date.now().toString()});
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