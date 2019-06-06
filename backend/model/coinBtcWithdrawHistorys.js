var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinBtcWithdrawHistorysSchema = require('../dao/coinBtcWithdrawHistorys');

module.exports = mongoose.model('CoinBtcWithdrawHistorys', coinBtcWithdrawHistorysSchema);
