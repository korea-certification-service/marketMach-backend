var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FaqSchema = new Schema({
    title: String,
    content: String,
    regDate: String,
    category: String,
    worker: String
});

module.exports = FaqSchema;
