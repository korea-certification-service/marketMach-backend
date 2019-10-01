var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var coinHistorysSchema = new Schema({
    txHash: String,
    extType: String,
    coinId: String,
    category: String,          
    status: String,
    currencyCode: String,
    amountCurrency: String,
    amount: Number,
    mach: Number,
    fee: Number,
    regDate: String,
    totalAmount: Number
});

module.exports = mongoose.model('CoinHistorys', coinHistorysSchema);
