let bitwebItems = require('./impl/items');
let db = require('../utils/db');

function list(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebItems.list(condition))
            .then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
        })
    })
}

function detail(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebItems.detail(condition))
            .then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
        })
    })
}

function add(country, data) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebItems.add(data))
            .then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
        })
    })
}

function modify(country, condition, data) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebItems.modify(condition, data))
            .then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
        })
    })
}

function remove(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebItems.remove(condition))
            .then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
        })
    })
}

function setUserInfoForVtr(users) {
    let from_findIndex = users.findIndex((group) => {
        return group._doc.userTag == req.body.from_userId;
    });

    let to_findIndex = users.findIndex((group) => {
        return group._doc.userTag == req.body.to_userId;
    });

    let result = {};

    //휴대전화번호 추가
    result['seller_phone'] = users[from_findIndex]._doc.phone;
    result['buyer_phone'] = users[to_findIndex]._doc.phone;

    return result;
}

function setGameCharacterForVtr(item) {
    let result = {};

    if (item._doc.trade_type == "buy") {
        result['buyer_game_character'] = item._doc.game_character;
        result['seller_game_character'] = item._doc.target_game_character;
    } else {
        result['buyer_game_character'] = item._doc.target_game_character;
        result['seller_game_character'] = item._doc.game_character;
    }

    return result;
}

exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;
exports.setUserInfoForVtr = setUserInfoForVtr;
