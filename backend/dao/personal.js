var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./image');

var personalSchema = new Schema({
    type: String,
    title: String,
    content: String,
    regDate: String,
    images: [Image],
    reply: String,
    replyDate: String,
    reporter: String,
    sendSms: Boolean,
    sendEmail: Boolean
});

module.exports = personalSchema;
