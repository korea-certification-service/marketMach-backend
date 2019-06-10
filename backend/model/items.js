var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var itemsSchema = require('../dao/items');

module.exports = mongoose.model('Items', itemsSchema);
