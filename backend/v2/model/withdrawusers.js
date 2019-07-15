var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var withdrawusersSchema = require('./include/withdrawusers');

module.exports = mongoose.model('Withdrawusers', withdrawusersSchema);
