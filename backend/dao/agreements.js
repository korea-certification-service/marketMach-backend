var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var agreementsSchema = new Schema({
    use: Boolean,       // 약관 동의서
    teenager: Boolean,  // 미성년자 확인
    privacy: Boolean,   // 개인정보 동의서
    pushTrade: Boolean, // 거래용 푸쉬 알람 동의서
    pushMarketing: Boolean, // 마케팅 동의서
    authPhone: Boolean
});

module.exports = agreementsSchema;
