var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var escrowInfosSchema = new Schema({
    vtrId: String,
    tradePointId:String,
    itemId: String,
    price: Number,
    sellerUser: String,
    buyerUser: String,
    cancelUser: String,
    cryptoCurrencyCode: String,
    price: Number,
    currencyCode:String,
    point: Number,
    status: String,   //processing, completed, cancelled
    regDate: String,
    completed_regDate: String,
    cancelled_regDate: String
});


module.exports = mongoose.model('Escrowinfos', escrowInfosSchema);
