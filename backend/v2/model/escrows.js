var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var escrowsSchema = new Schema({
    itemId: String,
    currencyCode: String,    
    price: Number,
    sellerUser: String,
    buyerUser: String,
    regDate: String
});


module.exports = mongoose.model('Escrows', escrowsSchema);
