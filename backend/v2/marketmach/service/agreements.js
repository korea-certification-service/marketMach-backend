let bitwebAgreements = require('./impl/agreements');
let db = require('../utils/db');

function list(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebAgreements.list(condition))
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
            .then(() => bitwebAgreements.detail(condition))
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
            .then(() => bitwebAgreements.detail(data))
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
            .then(() => bitwebAgreements.modify(condition, data))
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
            .then(() => bitwebAgreements.remove(condition))
            .then((result) => {
                resolve(result)
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