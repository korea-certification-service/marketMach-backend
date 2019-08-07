var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var Image = require('./include/image');
var kycsSchema = new Schema({
    userId: String,
    userTag: String,
    country: String,
    firstName: String,
    lastName: String,
    birth: String,
    gender: String,
    images: Image,
    idNo: String,
    issueDate: String,
    regDate: String,
    verification: Boolean,
    reason: String,
    type: String
});

module.exports = mongoose.model('Kycs', kycsSchema);
