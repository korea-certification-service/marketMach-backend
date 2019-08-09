var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var kycsSchema = new Schema({
    userId: String,
    userTag: String,
    country: String,
    firstName: String,
    lastName: String,
    middleName: String,
    birth: String,
    gender: String,
    images: Mixed,
    idNo: String,
    issueDate: String,
    regDate: String,
    verification: Boolean,
    reason: String,
    type: String,
    verificationDate:String
});

module.exports = mongoose.model('Kycs', kycsSchema);
