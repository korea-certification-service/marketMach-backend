var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var pointsSchema = require('../dao/points');

module.exports = mongoose.model('Points', pointsSchema);
