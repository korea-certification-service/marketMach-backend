var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinBtcHistorysSchema = require('../dao/coinBtcHistorys');

module.exports = mongoose.model('CoinBtcHistorys', coinBtcHistorysSchema);
