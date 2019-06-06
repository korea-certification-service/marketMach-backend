var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinMachHistorysSchema = require('../dao/coinMachHistorys');

module.exports = mongoose.model('CoinMachHistorys', coinMachHistorysSchema);
