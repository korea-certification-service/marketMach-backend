let bitwebVtrTemps = require('./impl/vtrTemps');
let db = require('../utils/db');

function list(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebVtrTemps.list(condition))
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
            .then(() => bitwebVtrTemps.detail(condition))
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
            .then(() => bitwebVtrTemps.add(data))
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
            .then(() => bitwebVtrTemps.modify(condition, data))
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
            .then(() => bitwebVtrTemps.remove(condition))
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