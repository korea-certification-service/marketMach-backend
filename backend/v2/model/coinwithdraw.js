var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinWithdrawSchema = new Schema({    
    userTag: String,
    address: String,
    cryptoCurrencyCode: String,
    amount: Number,
    status: String,
    regDate: String
});

module.exports = mongoose.model('coinWithdraws', coinWithdrawSchema);