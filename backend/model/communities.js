var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var CommunitySchema = require('../dao/communities');

module.exports = mongoose.model('Community', CommunitySchema);
