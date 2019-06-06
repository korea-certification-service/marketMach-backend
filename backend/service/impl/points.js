let PointTrade = require('../../model/pointTrade');
let PointBankHistorys = require('../../model/pointBankHistorys');
let PointHistorys = require('../../model/pointHistorys');
let Points = require('../../model/points');
var FeeHistorys = require('../../model/feeHistorys');

function listPointTrade (body,data) {
    return new Promise((resolve, reject) => {
        PointTrade.find(body)
            .limit(data.perPage)
            .skip(data.pageIdx * data.perPage)
            .sort({regDate: 'desc'})
            .exec(function (err, pointTrade) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getPointTradeAll done: ' + pointTrade)
                resolve(pointTrade)
            })
    })
}

function getPointBankHistorys(body, data) {
    return new Promise((resolve, reject) => {
        PointBankHistorys.find(body)
        .limit(data.perPage)
        .skip(data.pageIdx * data.perPage)
        .sort({regDate: 'desc'})
        .exec(function(err, pointBankHistorys) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getPointBankHistorys done: ' + pointBankHistorys);
                resolve(pointBankHistorys);
            }
        )
    })
}

function getPointsByIds(ids) {
    return new Promise((resolve, reject) => {
        Points.find({
            "_id": {$in: ids},
        })
        .exec(function(err, points) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getPointsByIds done: ' + points);
                resolve(points);
            }
        )
    })
}

function updateWithdrawStatus(pointId, body) {
    return new Promise((resolve, reject) => {
        PointBankHistorys.findOneAndUpdate(
            {
                "_id": pointId
            },
            {
                $set: {"status": body.status}
            },
            {upsert: false, new: true},
            function (err, data) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(data)
            })
    })
}

function getTradePointById (tradePointId) {
    return new Promise((resolve, reject) => {
        PointTrade.findOne(
            {"_id": tradePointId},
            function(err, tradePoint) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getTradePointById done: ' + tradePoint)
                resolve(tradePoint)
            }
        )
    })
}

function updatePointsTrade(tradePointId, data) {
    return new Promise((resolve, reject) => {
        PointTrade.findOneAndUpdate(
            {"_id": tradePointId},
            {$set: data},
            function(err, point) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updatePoints done: ' + point)
                resolve(point)
            }
        )
    })
}

function updatePointHistory(id, data) {
    return new Promise((resolve, reject) => {
        PointHistorys.findOneAndUpdate(
            {"_id": id},
            {$set: data},
            function(err, point) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updatePointHistory done: ' + point)
                resolve(point)
            }
        )
    })
}

function getPointById (id) {
    return new Promise((resolve, reject) => {
        Points.findOne(
            {"_id": id},
            function(err, point) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getPointById done: ' + point)
                resolve(point)
            }
        )
    })
}

function updatePoints (id, body) {
    return new Promise((resolve, reject) => {
        Points.findOneAndUpdate(
            {"_id": id},
            {$set: body},
            function(err, point) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updatePoints done: ' + point)
                resolve(point)
            }
        )
    })
}

function deletePointsTrade(id) {
    return new Promise((resolve, reject) => {
        PointTrade.findByIdAndRemove(
            id,
            function (err, tradePoint) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('deletePointsTrade done: ' + tradePoint)
                resolve(tradePoint)
            }
        )
    })
}

function deletePointHistory(id) {
    return new Promise((resolve, reject) => {
        PointHistorys.findOneAndRemove(
            {"pointId": id}
        )
        .exec(function (err, pointHistory) {
            if (err) {
                console.error(err)
                reject(err)
            }
            console.log('deletePointsTrade done: ' + pointHistory)
            resolve(pointHistory)
        })
    })
}

function getPointHistorys(data, option) {
    return new Promise((resolve, reject) => {
        PointHistorys.find(data)
        .limit(option.perPage)
        .skip(option.pageIdx * option.perPage)
        .sort({regDate:'desc'})
        .exec(function (err, pointHistorys) {
            if (err) {
                console.error(err)
                reject(err)
            }
            console.log('getPointHistorys done: ' + pointHistorys)
            resolve(pointHistorys)
        })
    })
}

function updatePointById(pointId, body) {
    return new Promise((resolve, reject) => {
        Points.findOneAndUpdate(
            {"_id": pointId
            },
            {$set: body
            },
            {upsert: false, new: true},
            function(err, data) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(data)
            })
    })
}

function createFeeHistory (data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        var feeHistorys = new FeeHistorys(data)
        feeHistorys.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result)
            }
        })
    })
}


exports.listPointTrade = listPointTrade;
exports.getPointBankHistorys = getPointBankHistorys;
exports.getPointsByIds = getPointsByIds;
exports.updateWithdrawStatus = updateWithdrawStatus;
exports.getTradePointById = getTradePointById;
exports.updatePointsTrade = updatePointsTrade;
exports.getPointById = getPointById;
exports.updatePoints = updatePoints;
exports.deletePointsTrade = deletePointsTrade;
exports.updatePointHistory = updatePointHistory;
exports.deletePointHistory = deletePointHistory;
exports.getPointHistorys = getPointHistorys;
exports.updatePointById = updatePointById;
exports.createFeeHistory = createFeeHistory;