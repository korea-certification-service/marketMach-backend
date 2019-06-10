var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var UserSchema = require('../dao/users');

module.exports = mongoose.model('Users', UserSchema);
