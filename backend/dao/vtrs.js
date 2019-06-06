var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./items');

var vtrsSchema = new Schema({
    mach: Number,
    buy_status: Boolean,
    sell_status: Boolean,
    completed: Boolean,
    item: Item,
    from_userId: String,
    to_userId: String,
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
    opposition_date: String
});

module.exports = vtrsSchema;
