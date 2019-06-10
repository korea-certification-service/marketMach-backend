var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinHistorysSchema = require('../dao/coinHistorys');

module.exports = mongoose.model('CoinHistorys', coinHistorysSchema);
