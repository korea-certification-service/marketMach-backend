var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./image');
//var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

var itemsSchema = new Schema({
    userTag: String,
    vtrId: String,              // 거래 발생시
    tradePointId: String,       // Point 거래 발생시
    type: String,               // item, gameMoney
    delivery_type: String,      // 직구매, 무료배송, 착불배송
    trade_type: String,         // buy|sell
    category: String,           // game|etc
    category1: String,           // 대카테고리
    category2: String,           // 고카테고리
    game_name: String,
    game_server: String,
    china_region1: String,      //중국서버 일때 시
    china_region2: String,      //중국서버 일때 지구
    name: String,
    title: String,
    title_en: String,
    desc: String,
    desc_en: String,
    price: Number,
    cryptoCurrencyCode: String,
    currency: String,
    point: Number,
    count: Number,
    minCount: Number,
    maxCount: Number,
    total_price: Number,        //count와 합산된 금액
    total_point: Number,        //count와 합산된 포인트
    game_character: String,
    target_game_character: String,
    status: Number,             // 거래등록= 0, 거래중= 1, 거래완료= 2
    regDate: String,
    modifyDate: String,
    tradeDate: String,
    reg_ip:String,
    images: [Image],               // s3
    roomToken:String,
    item_tag:String,
    vtrTempId: String,
    clicked: Number,
    primeService: String,
    country: String,
    vtr: Mixed,
    pointTrade: Mixed,
});

module.exports = itemsSchema;
