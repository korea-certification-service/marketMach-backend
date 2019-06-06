var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var vtrsSchema = require('../dao/vtrs');

module.exports = mongoose.model('Vtrs', vtrsSchema);
