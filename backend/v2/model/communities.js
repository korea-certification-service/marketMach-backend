var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./include/image');

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
    nottobeCount: Number,
    images: [Image]               // s3
});

module.exports = mongoose.model('Community', CommunitySchema);
