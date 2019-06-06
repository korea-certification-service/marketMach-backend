var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var UserSchema = require('../dao/user');

module.exports = mongoose.model('Users', UserSchema);
