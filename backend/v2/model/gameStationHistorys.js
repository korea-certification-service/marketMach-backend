var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameCenterHistorysSchema = new Schema({
    service: String, 
    type: String,
    userId: String,
    storedCoin: Number,
    ingameCoin: Number,
    exchangeCoin: Number,
    saveTotalCoin: Number,
    regDate: String,
    sessionToken: String
});

module.exports = mongoose.model('GameCenterHistorys', GameCenterHistorysSchema);
