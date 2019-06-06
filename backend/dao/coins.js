var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinsSchema = new Schema({
    userId: String,
    mach_address: String,               //bitweb block chain address
    btc_address: String,                //user block chain address
    ether_address: String,
    total_mach: Number,
    // total_btc: Number,
    // total_ether: Number,
    // historys: [String],
    ether_historys: [String],           //ether를 입금 했을때
    btc_historys: [String],             //btc를 입금 했을때
    mach_historys: [String],            //mach를 입금 했을때
    ether_withdraw_historys: [String],  //ether를 출금 했을때
    btc_withdraw_historys: [String],    //btc를 출금 했을때
    mach_withdraw_historys: [String],   //mach를 출금 했을때

});

module.exports = coinsSchema;
