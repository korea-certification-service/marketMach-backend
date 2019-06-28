let db = require('../utils/db');
let Users = require('../../model/users');

function count(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Users.count(
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

function list(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Users.find(
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
            Users.findOne(
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
            var users = new Users(data)
            users.save(function (err, result) {
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
        .then(() =>{
            Users.findOneAndUpdate(
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
            Users.findByIdAndRemove(
            condition,
            function(err, user) {
                if (err) {
                    reject(err)
                }
                resolve(user)
            })
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