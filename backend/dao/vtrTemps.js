var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./items');

var vtrtempsSchema = new Schema({
    country: String,
    item: Item,
    roomToken: String,
    seller_id: String,
    buyer_id: String,
    cmod: String,
    regDate: String
});

module.exports = vtrtempsSchema;
