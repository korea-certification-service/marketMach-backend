var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FaqSchema = new Schema({
    country: String,
    title: String,
    content: String,
    regDate: String,
    category: String,
    worker: String
});

module.exports = mongoose.model('Faq', FaqSchema);
