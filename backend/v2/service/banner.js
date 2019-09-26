let Banners = require('../model/banner');
let db = require('../utils/db');

async function list(country, condition) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Banners.find(
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

async function detail(country, condition) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Banners.findOne(
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

async function add(country, data) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                var banners = new Banners(data)
                banners.save(function (err, result) {
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

async function modify(country, condition, data) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Banners.findOneAndUpdate(
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

async function remove(country, condition) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            db.connectDB(country)
            .then(() => {
                Banners.findByIdAndRemove(
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