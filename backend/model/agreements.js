var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var agreementsSchema = require('../dao/agreements');

module.exports = mongoose.model('Agreements', agreementsSchema);
