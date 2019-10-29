var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pointHistorysSchema = new Schema({
    type: String,
    extType: String,
    pointId: String,
    category: String,          
    status: String,
    currencyCode: String,
    amountCurrency: String,
    amount: Number,
    point: Number,
    fee: Number,
    bankAccountType: String,
    bankAccount: String,
    userName: String,
    regDate: String,
    memo: String
});

module.exports = mongoose.model('pointHistorys', pointHistorysSchema);