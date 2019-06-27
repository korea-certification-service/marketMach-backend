var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var escrowsSchema = require('../dao/escrows');

module.exports = mongoose.model('Escrows', escrowsSchema);
