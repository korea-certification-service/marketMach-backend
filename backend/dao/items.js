var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./image');
var ObjectId = Schema.Types.ObjectId;

var itemsSchema = new Schema({
    userTag: String,
    vtrId: String,              // 거래 발생시
    type: String,               // item, gameMoney
    trade_type: String,         // buy|sell
    category: String,           // game|etc
    game_name: String,
    game_server: String,
    china_region1: String,      //중국서버 일때 시
    china_region2: String,      //중국서버 일때 지구
    name: String,
    title: String,
    desc: String,
    price: Number,
    point: Number,
    count: Number,
    minCount: Number,
    maxCount: Number,
    total_price: Number,        //count와 합산된 금액
    total_point: Number,        //count와 합산된 포인트
    game_character: String,
    status: Number,             // 거래등록= 0, 거래중= 1, 거래완료= 2
    regDate: String,
    modifyDate: String,
    tradeDate: String,
    reg_ip:String,
    images: Image               // s3
});

module.exports = itemsSchema;
