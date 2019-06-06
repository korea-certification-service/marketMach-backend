var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinEtherWithdrawHistorysSchema = new Schema({
    coinId: String,
    address: String,
    price: Number,                  // 구입예정인 금액
    completedPrice: Number,         // 실제로 반영된 금액
    mach: Number,
    status: Boolean,                // false:거래완료 이전, true:거래완료
    regDate: String,                // instance가 만들어 졌을때 시간
    completeDate: String,           // 거래완료 되었을때 시간
    transaction: String,            // 출금 처리 된 후 받는 transaction
});

module.exports = coinEtherWithdrawHistorysSchema;
