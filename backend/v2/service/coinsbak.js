let Coins = require('../model/coinsbak');
let db = require('../utils/db');

function list(country, condition) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Coins.find(
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
        });
    })
}

function detail(country, condition) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Coins.findOne(
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
        });
    })
}

function add(country, data) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                var coins = new Coins(data)
                coins.save(function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            }).catch((err) => {
                reject(err)
            })
        });
    })
}

function modify(country, condition, data) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Coins.findOneAndUpdate(
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
        });
    })
}

function remove(country, condition) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Coins.findOneAndRemove(
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
        });
    })
}

exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;