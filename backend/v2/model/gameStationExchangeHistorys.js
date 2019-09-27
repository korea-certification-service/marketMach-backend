var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameCenterExchangeHistorySchema = new Schema({
    userId: String,
    game: String,
    category: String,
    gamecoin: Number,
    price: Number,
    rate: Number,
    regDate : String
});

module.exports = mongoose.model('gameCenterExchangeHistorys', gameCenterExchangeHistorySchema);
