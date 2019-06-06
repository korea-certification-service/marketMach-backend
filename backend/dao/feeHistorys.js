var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feeHistorysSchema = new Schema({
    userId: String,
    currency: String,
    type: String,
    amount: Number,
    fee: Number,
    regDate: String  
});


module.exports = feeHistorysSchema;
