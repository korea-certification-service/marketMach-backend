var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    path: String,           // s3에 생성된 링크
    bucket: String,         // s3에 저장 되는 위치
    key: String,            // s3에서 생성된 이름
    origin_name: String,    // 이미지 원본 이름
    size: Number,           // 이미지 크기
    mimetype: String,       // 이미지 타입
    regDate: String,
});

module.exports = imageSchema;
