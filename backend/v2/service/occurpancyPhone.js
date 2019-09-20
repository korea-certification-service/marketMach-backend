let db = require('../utils/db');
var OccupancyPhones = require('../model/occupancyPhone');

function count(country, condition, option) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            OccupancyPhones.count(condition)
            .exec(function(err, occupancyPhones) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                resolve(occupancyPhones)
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
            OccupancyPhones.find(condition)
            .limit(option.perPage)
            .skip(option.pageIdx * option.perPage)
            .sort({regDate:'desc'})
            .exec(function(err, occupancyPhones) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                resolve(occupancyPhones)
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
            OccupancyPhones.findOne(condition)
            .sort({regDate:'desc'})
            .exec(function(err, occupancyPhone) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                resolve(occupancyPhone)
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
            var occupancyPhones = new OccupancyPhones(reqData)
            occupancyPhones.save(function (err, result) {
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