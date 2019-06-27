var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var Item = require('../include/items');

var vtrTempsSchema = new Schema({
    country: String,
    item: Item,
    roomToken: String,
    seller_id: String,
    buyer_id: String,
    cmod: String,
    regDate: String
});

module.exports = mongoose.model('VtrTemps', vtrTempsSchema);
