var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var ReplySchema = new Schema({
    communityId: String,
    replyId: String,
    content: String,
    regDate: String,
    reporter: String,
    recommand: Mixed,
    nottobe: Mixed
});

module.exports = mongoose.model('Reply', ReplySchema);
