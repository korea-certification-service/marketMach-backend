var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var coinsSchema = new Schema({
    userId: String,
    mach_address: String,               //bitweb block chain address
    btc_address: String,                //user block chain address
    ether_address: String,
    ont_address: String,
    total_mach: Number,
    output_total_mach: Number,
    total_btc: Number,
    total_ether: Number,
    total_ont: Number,
    firstItem: Boolean,
    firstReply: Boolean,
    firstVtr: Boolean
});

module.exports = mongoose.model('Coins', coinsSchema);
