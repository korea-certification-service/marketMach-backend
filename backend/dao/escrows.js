var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var escrowsSchema = new Schema({
    itemId: String,
    currencyCode: String,    
    price: Number,
    sellerUser: String,
    buyerUser: String,
    regDate: String
});

module.exports = escrowsSchema;
