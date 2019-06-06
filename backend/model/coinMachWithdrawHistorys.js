var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinMachWithdrawHistorysSchema = require('../dao/coinMachWithdrawHistorys');

module.exports = mongoose.model('CoinMachWithdrawHistorys', coinMachWithdrawHistorysSchema);
