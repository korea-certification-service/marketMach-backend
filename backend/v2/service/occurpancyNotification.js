let db = require('../utils/db');
var OccurpancyNotifications = require('../model/occupancyNotification');

function count(country, condition) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            OccurpancyNotifications.count(condition)
            .exec(function(err, occurpancyNotifications) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                resolve(occurpancyNotifications)
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
            OccurpancyNotifications.find(condition)
            .limit(option.perPage)
            .skip(option.pageIdx * option.perPage)
            .sort({regDate:'desc'})
            .exec(function(err, occurpancyNotifications) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                resolve(occurpancyNotifications)
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
            OccurpancyNotifications.findOne(condition)
            .sort({regDate:'desc'})
            .exec(function(err, occurpancyNotification) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                resolve(occurpancyNotification)
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

function add(country, reqData) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            var occurpancyNotifications = new OccurpancyNotifications(reqData)
            occurpancyNotifications.save(function (err, result) {
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

exports.count = count;
exports.list = list;
exports.add = add;
exports.detail = detail;