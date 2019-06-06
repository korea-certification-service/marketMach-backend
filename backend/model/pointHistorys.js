var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var pointHistorysSchema = require('../dao/pointHistorys');

module.exports = mongoose.model('PointHistorys', pointHistorysSchema);
