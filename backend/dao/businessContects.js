var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BusinessContactSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    title: String,
    content: String,
    regDate: String
});

module.exports = BusinessContactSchema;
