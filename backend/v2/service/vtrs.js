let Vtrs = require('../model/vtrs');
let db = require('../utils/db');

function count(country, condition, option) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Vtrs.count(condition)
            .limit(100)
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

function list(country, condition, option) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Vtrs.find(condition)
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
            Vtrs.findOne(
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
            var vtrs = new Vtrs(data)
            vtrs.save(function (err, result) {
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
            Vtrs.findOneAndUpdate(
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
            Vtrs.findOneAndRemove(
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

exports.count = count;
exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;