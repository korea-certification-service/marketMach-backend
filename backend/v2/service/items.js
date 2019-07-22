let Items = require('../model/items');
let db = require('../utils/db');

function list(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Items.find(
                condition,
                function(err, result) {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                }
            )
        }).catch((err) => {
            reject(err)
        })
    })
}

function detail(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Items.findOne(
                condition,
                function(err, result) {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                }
            )
        }).catch((err) => {
            reject(err)
        })
    })
}

function add(country, data) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            var items = new Items(data)
            items.save(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

function modify(country, condition, data) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Items.findOneAndUpdate(
            condition,
            data,
            {upsert: false, new: true},
            function(err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

function remove(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Items.findByIdAndRemove(
                condition,
                function(err, user) {
                    if (err) {
                        reject(err)
                    }
                    resolve(user)
                }
            )
        }).catch((err) => {
            reject(err)
        })
    })
}

function setUserInfoForVtr(users, body) {
    let from_findIndex = users.findIndex((group) => {
        return group._doc.userTag == body.sellerTag;
    });

    let to_findIndex = users.findIndex((group) => {
        return group._doc.userTag == body.buyerTag;
    });

    let result = {
        "from_userId": users[from_findIndex]._doc._id,
        "to_userId": users[to_findIndex]._doc._id
    };

    //휴대전화번호 추가
    result['seller_phone'] = users[from_findIndex]._doc.phone;
    result['buyer_phone'] = users[to_findIndex]._doc.phone;

    return result;
}

exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;
exports.setUserInfoForVtr = setUserInfoForVtr;
