var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./include/image');
var Mixed = Schema.Types.Mixed;

var CommunitySchema = new Schema({
    country:String,
    type: String,   //movie, board
    title: String,
    content: String,
    movieUrl: String,
    count: Number,
    regDate: String,
    reporter: String,
    recommandCount: Number,
    recommand: Mixed,
    nottobe: Mixed,
    images: [Image]               // s3
});

module.exports = mongoose.model('Community', CommunitySchema);
