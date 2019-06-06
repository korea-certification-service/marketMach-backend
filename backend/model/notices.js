var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var NoticeSchema = require('../dao/notices');

module.exports = mongoose.model('Notices', NoticeSchema);
