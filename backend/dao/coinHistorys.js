var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinHistorysSchema = new Schema({
    extType: String,
    coinId: String,
    category: String,          
    status: String,
    currencyCode: String,
    amountCurrency: String,
    amount: Number,
    mach: Number,
    fee: Number,
    regDate: String  
});


module.exports = coinHistorysSchema;
