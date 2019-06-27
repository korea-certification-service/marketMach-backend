var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var escrowsSchema = new Schema({
    escrowId: String,
    itemId: String,
    state: String, 
    currencyCode: String,
    price: Number,
    sellerUser: String,
    buyerUser: String,
    cancelUser: String,
    regDate: String
});

module.exports = escrowsSchema;
