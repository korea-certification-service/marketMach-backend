var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var escrowHistorysSchema = require('../dao/escrowHistorys');

module.exports = mongoose.model('EscrowHistorys', escrowHistorysSchema);
