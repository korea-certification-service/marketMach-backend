var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var coinHistorysSchema = new Schema({
    txHash: String,
    fromAddress:String,
    extType: String,
    coinId: String,
    category: String,          
    status: String,
    currencyCode: String,
    amountCurrency: String,
    amount: Number,
    price: Number,
    fee: Number,
    regDate: String,
    reqDate: String,
    totalAmount: Number,
    memo: String,
    game: String
});

module.exports = mongoose.model('CoinHistorys', coinHistorysSchema);
