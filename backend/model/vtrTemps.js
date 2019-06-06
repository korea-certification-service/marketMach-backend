var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var vtrTempsSchema = require('../dao/vtrTemps');

module.exports = mongoose.model('VtrTemps', vtrTempsSchema);
