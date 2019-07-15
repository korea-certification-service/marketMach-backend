var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var blacklistSchema = require('./include/blacklist');

module.exports = mongoose.model('Blacklists', blacklistSchema);