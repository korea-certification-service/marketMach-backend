var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var FaqSchema = require('../dao/faq');

module.exports = mongoose.model('Faq', FaqSchema);
