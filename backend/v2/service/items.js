let Items = require('../model/items');
let ItemReplys = require("../model/replyItems");
let db = require('../utils/db');

function count(country, condition, option) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Items.count(condition)
            .limit(100)
            .skip(option.pageIdx * option.perPage)
            .sort({regDate:'desc'})
            .exec(function (err, count) {
                    if (err) {
                        reject(err)
                    }
                    resolve(count)
                }
            )
        }).catch((err) => {
            reject(err)
        })
    })
}

function list(country, condition, option) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Items.find(condition)
            .limit(option.perPage)
            .skip(option.pageIdx * option.perPage)
            .sort({regDate:'desc'})
            .exec(function (err, list) {
                if (err) {
                    reject(err)
                }
                resolve(list)
            })
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
            Items.findOneAndRemove(
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

function getReplys(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            ItemReplys.find(
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

function addReply (country, body) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            console.log(body)
            var itemReplys = new ItemReplys(body)
            itemReplys.save(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result)
                }
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

function modifyReply(country, conditdion, body) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            ItemReplys.findOneAndUpdate(
            conditdion,
            {$set: body
            },
            {upsert: false, new: true},
            function(err, data) {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

function removeReply(country, conditdion) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            ItemReplys.findOneAndRemove(
                conditdion,
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
    result['seller_phone'] = users[from_findIndex]._doc.countryCode + users[from_findIndex]._doc.phone;
    result['buyer_phone'] = users[from_findIndex]._doc.countryCode + users[to_findIndex]._doc.phone;

    return result;
}

exports.count = count;
exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;
exports.getReplys = getReplys;
exports.addReply = addReply;
exports.modifyReply = modifyReply;
exports.removeReply = removeReply;
exports.setUserInfoForVtr = setUserInfoForVtr;
