var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var CmsSchema = require('../dao/cms');

module.exports = mongoose.model('Cms', CmsSchema);
