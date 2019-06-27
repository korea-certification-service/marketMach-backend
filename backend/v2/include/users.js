var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var usersSchema = new Schema({
    userTag: String,
    userName: String,
    password: String,
    email: String,
    active: Boolean,
    countryCode: String,
    phone: String,
    country: String, //한국:kr, 중국:cn
    // phone_auth_code: String,
    // otp_auth_code: String,
    mail_auth_code: String,
    regDate: String,          //회원가입 날짜
    updateDate: String,
    lastLoginData: String,
    etherId: ObjectId,
    // bankId: ObjectId,
    agreementId: ObjectId,
    coinId: ObjectId,
    pointId: ObjectId,
    loginToken: String,
    extLoginType: String,
    recommander: String,
    bitberry_token: String,
    bitberry_user_id: String,
    gameCenterId: ObjectId,
    sessionToken: String,
    birth: String,
    sex: String,
    commId: String, 
    foreigner: String
});

module.exports = usersSchema;
