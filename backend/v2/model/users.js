var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var UserSchema = require('../include/users');

module.exports = mongoose.model('Users', UserSchema);
