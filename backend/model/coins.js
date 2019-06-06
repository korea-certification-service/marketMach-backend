var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var coinsSchema = require('../dao/coins');

module.exports = mongoose.model('Coins', coinsSchema);
