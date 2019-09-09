var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoticeSchema = new Schema({
    country: String,
    type: String,
    title: String,
    content: String,
    regDate: String,
    worker: String
});

module.exports = mongoose.model('Notices', NoticeSchema);