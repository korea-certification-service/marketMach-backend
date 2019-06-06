var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pointBankHistorysSchema = new Schema({
    pointId: String,
    type: String,                       // deposit, withdraw
    imp_uid: String,                    // 결제 성공시 iamport 고유아이디
    imp_apply_num: String,              // 카드 승인 번호
    // bank_account_type: String,          // 계좌은행
    // bank_account: String,               // 계좌번호
    point: Number,                      // 받을 포인트 금액
    price: Number,                      // 결제된 금액
    status: Number,
    userName: String,
    regDate: String                    // instance가 만들어 졌을때 시간
});

module.exports = pointBankHistorysSchema;
