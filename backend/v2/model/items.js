var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var itemsSchema = require('./include/items');

module.exports = mongoose.model('Items', itemsSchema);
