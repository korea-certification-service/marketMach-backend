var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var escrowsSchema = new Schema({
    escrowId: String,
    type: String, //deposit/withdraw/cancel
    itemId: String,
    vtr: Mixed,
    pointTrade: Mixed,
    cryptoCurrencyCode: String,
    price: Number,
    mach: Number, 
    point: Number,
    reqUser: String,
    regDate: String
});


module.exports = mongoose.model('Escrows', escrowsSchema);
