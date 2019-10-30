var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var eventShopSchema = new Schema({
    productType: {type: String, default:"0"},    //제품타입 : 0-기타, 추가 정의 가능
    productName: String,
    productDesc: String,
    totalAmount: Number,
    leftAmount: Number,
    country: String,
    originalPrice: Number,
    price: Number,
    percentage: Number,
    thumnail: [Mixed],
    imageDetail: [Mixed],
    deliveryType: String,
    deliveryPrice: Number,
    options: [Mixed],
    eventEnd: Boolean,
    regDate: String,
    worker: String
});

module.exports = mongoose.model('eventShops', eventShopSchema);
