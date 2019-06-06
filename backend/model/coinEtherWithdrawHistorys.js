var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinEtherWithdrawHistorysSchema = require('../dao/coinEtherWithdrawHistorys');

module.exports = mongoose.model('CoinEtherWithdrawHistorys', coinEtherWithdrawHistorysSchema);
