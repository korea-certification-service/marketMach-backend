var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var pointBankHistorysSchema = require('../dao/pointBankHistorys');

module.exports = mongoose.model('PointBankHistorys', pointBankHistorysSchema);
