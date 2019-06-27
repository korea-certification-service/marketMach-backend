var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var escrowHistorysSchema = new Schema({
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

module.exports = mongoose.model('EscrowHistorys', escrowHistorysSchema);
