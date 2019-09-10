var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./include/items');
var ObjectId = Schema.Types.ObjectId;

var vtrsSchema = new Schema({
    cryptoCurrencyCode: String,
    country: String,
    price: Number,
    mach: Number,
    buy_status: Boolean,
    sell_status: Boolean,
    confirm_status: Boolean,
    completed: Boolean,
    item: Item,
    from_userId: ObjectId,
    to_userId: ObjectId,
    regDate: String,
    completed_date: String,
    completed_buy_date: String,
    completed_sell_date: String,
    completed_confirm_date: String,
    buyer_game_character: String,
    seller_game_character: String,
    buyer_phone: String,
    seller_phone: String,
    auto_completed_confirm_date: String,
    opposition_date: String,
    roomToken: String
});

module.exports = mongoose.model('Vtrs', vtrsSchema);
