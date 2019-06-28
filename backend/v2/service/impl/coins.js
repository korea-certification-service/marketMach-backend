let Coins = require('../../../model/Coins');

function list(condition) {
    return new Promise((resolve, reject) => {
        Coins.find(
            condition,
            function(err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            }
        )
    })
}

function detail(condition) {
    return new Promise((resolve, reject) => {
        Coins.findOne(
            condition,
            function(err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            }
        )
    })
}

function add(data) {
    return new Promise((resolve, reject) => {
        var coins = new Coins(data)
        coins.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

function modify(condition, setData) {
    return new Promise((resolve, reject) => {
        Coins.findOneAndUpdate(
            condition,
            setData,
            {upsert: false, new: true},
            function(err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
    })
}

function remove(condition) {
    return new Promise((resolve, reject) => {
        Coins.findByIdAndRemove(
            condition,
            function(err, user) {
                if (err) {
                    reject(err)
                }
                resolve(user)
            }
        )
    })
}

exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;