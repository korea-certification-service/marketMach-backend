var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var PersonalSchema = require('../dao/personal');

module.exports = mongoose.model('Personals', PersonalSchema);
