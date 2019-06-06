var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var withdrawUsersSchema = require('../dao/withdrawUsers');

module.exports = mongoose.model('WithdrawUsers', withdrawUsersSchema);
