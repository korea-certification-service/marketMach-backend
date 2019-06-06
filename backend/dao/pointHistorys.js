var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pointHistorysSchema = new Schema({
    pointId: String,
    type: String,                    //deposit/withdraw
    extType: String,                 //happymoney, bank, mach
    amountCurrency: String,
    amount: Number,                  //입/출금 요청 양
    point: Number,                   //amount에 비례하는 캐시 양
    rate: Number,                    // 환율
    fee: Number,                     // 환전 수수료(출금, mach 교환인 경우에만 입력)
    status: Boolean,                // false:거래완료 이전, true:거래완료
    regDate: String                // instance가 만들어 졌을때 시간
});

module.exports = pointHistorysSchema;
