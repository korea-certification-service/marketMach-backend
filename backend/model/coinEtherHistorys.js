var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinEtherHistorysSchema = require('../dao/coinEtherHistorys');

module.exports = mongoose.model('CoinEtherHistorys', coinEtherHistorysSchema);
