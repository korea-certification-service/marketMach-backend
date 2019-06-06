var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var feeHistorysSchema = require('../dao/feeHistorys');

module.exports = mongoose.model('FeeHistorys', feeHistorysSchema);
