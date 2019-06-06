var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var staffSchema = new Schema({
    userTag: String,
    userName: String,
    password: String,
    email: String,
    active: Boolean,
    phone: String,
    // phone_auth_code: String,
    // otp_auth_code: String,
    // mail_auth_code: String,
    regDate: String,          //회원가입 날짜
    updateDate: String,
    lastLoginData: String

});

module.exports = staffSchema;
