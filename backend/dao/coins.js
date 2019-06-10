var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinsSchema = new Schema({
    userId: String,
    mach_address: String,               //bitweb block chain address
    btc_address: String,                //user block chain address
    ether_address: String,
    total_mach: Number,
    output_total_mach: Number,
    total_btc: Number,
    total_ether: Number,
    firstItem: Boolean,
    firstReply: Boolean,
    firstVtr: Boolean
});

module.exports = coinsSchema;
