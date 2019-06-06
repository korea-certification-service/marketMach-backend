var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var BusinessContactSchema = require('../dao/businessContects');

module.exports = mongoose.model('BusinessContacts', BusinessContactSchema);
