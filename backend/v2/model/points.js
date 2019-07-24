var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var pointsSchema = new Schema({
    historys: Array,
    withdraw_historys: Array,
    back_historys: Array,
    bank_account_type: String,
    bank_account: String,
    total_point: Number,
    userId: String
});


module.exports = mongoose.model('Points', pointsSchema);