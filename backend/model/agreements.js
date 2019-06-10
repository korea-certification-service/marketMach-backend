var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var agreementsSchema = require('../model/agreements');

module.exports = mongoose.model('Agreements', agreementsSchema);
