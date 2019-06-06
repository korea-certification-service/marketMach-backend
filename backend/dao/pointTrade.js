var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./items');

var pointTeadeSchema = new Schema({
    point: Number,
    buy_status: Boolean,
    sell_status: Boolean,
    completed: Boolean,
    item: Item,
    from_userId: String,
    to_userId: String,
    regDate: String,
    completed_date: String,
    completed_buy_date: String,
    completed_sell_date: String

});

module.exports = pointTeadeSchema;
