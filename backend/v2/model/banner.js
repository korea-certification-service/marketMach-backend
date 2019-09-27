var mongoose = require('mongoose');
var Image = require('./include/image');
var Schema = mongoose.Schema;

var BannerSchema = new Schema({
    title: String,
    url: String,
    image: Image,
    regDate: String,
    modifyDate: String,
    order: Number
});

module.exports = mongoose.model('Banners', BannerSchema);
