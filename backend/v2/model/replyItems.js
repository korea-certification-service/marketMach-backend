var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReplyItemsSchema = new Schema({
    itemId: String,
    replyId: String,
    content: String,
    regDate: String,
    reporter: String,
    recommandCount: Number,
    nottobeCount: Number
});
module.exports = mongoose.model('ReplyItems', ReplyItemsSchema);
