let VtrTemps = require('../model/vtrTemps');
let db = require('../utils/db');

function list(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            VtrTemps.find(
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
            VtrTemps.findOne(
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
            var vtrTemps = new VtrTemps(data)
            vtrTemps.save(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
        .catch((err) => {
            reject(err)
        })
    })
}

function modify(country, condition, data) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            VtrTemps.findOneAndUpdate(
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
        })
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
        .then(() => {
            VtrTemps.findOneAndRemove(
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

exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;