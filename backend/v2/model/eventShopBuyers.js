var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var eventShopBuyerSchema = new Schema({
    eventShopId: String,
    productType: String,
    productName: String,
    country: String,
    userTag: String,
    receiver: String,
    countryCode: String,
    phone: String,
    currencyType: String,
    selectedOptions:[Mixed],
    totalAmount: Number,
    totalPrice: Number,
    postcode: String,
    address: String,
    regDate: String,
    memo: String
});

module.exports = mongoose.model('eventShopBuyers', eventShopBuyerSchema);
