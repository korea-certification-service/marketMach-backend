var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var pointTradeSchema = require('../dao/pointTrade');

module.exports = mongoose.model('pointTrade', pointTradeSchema);
