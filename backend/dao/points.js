var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var bank_history = require('./pointBankHistorys')

var pointsSchema = new Schema({
    userId: String,
    bank_account_type: String,          //은행사 ex(신한은행, 기업은행)
    bank_account: String,               //계좌번호
    total_point: Number,
    historys: [String],                 //결제 내역
    bank_historys: [String]             //입출금 내역
});

module.exports = pointsSchema;
