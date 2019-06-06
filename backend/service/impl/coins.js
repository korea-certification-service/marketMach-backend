var Coins = require('../../model/coins');
var CoinBtcHistorys = require('../../model/coinBtcHistorys');
var CoinEtherHistorys = require('../../model/coinEtherHistorys');
var CoinMachHistorys = require('../../model/coinMachHistorys');
var CoinBtcWithdrawHistory = require('../../model/coinBtcWithdrawHistorys');
var CoinEtherWithdrawHistory = require('../../model/coinEtherWithdrawHistorys');
var CoinMachWithdrawHistory = require('../../model/coinMachWithdrawHistorys');

function getCoinById(coinId) {
    return new Promise((resolve, reject) => {
        Coins.findOne({"_id":coinId})
            .exec(function (err, coin) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getCoinById done: ' + coin)
                resolve(coin)
            })
    })
}

function listBtcDepositHistory(body) {
    return new Promise((resolve, reject) => {
        CoinBtcHistorys.find(body)
            .sort({regDate: 'desc'})
            .exec(function (err, coinHistory) {
                    if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(coinHistory)
            })
    });
}

function listEtherDepositHistory(body) {
    return new Promise((resolve, reject) => {
        CoinEtherHistorys.find(body)
            .sort({regDate: 'desc'})
            .exec(function (err, coinHistory) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(coinHistory)
            })
    });
}

function listMachDepositHistory(body) {
    return new Promise((resolve, reject) => {
        CoinMachHistorys.find(body)
            .sort({regDate: 'desc'})
            .exec(function (err, coinHistory) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(coinHistory)
            })
    });
}

function listBtcWithdrawHistory(body) {
    return new Promise((resolve, reject) => {
        CoinBtcWithdrawHistory.find(body)
            .sort({regDate: 'desc'})
            .exec(function (err, coinHistory) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(coinHistory)
            })
    });
}

function listEtherWithdrawHistory(body) {
    return new Promise((resolve, reject) => {
        CoinEtherWithdrawHistory.find(body)
            .sort({regDate: 'desc'})
            .exec(function (err, coinHistory) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(coinHistory)
            })
    });
}

function listMachWithdrawHistory(body) {
    return new Promise((resolve, reject) => {
        CoinMachWithdrawHistory.find(body)
            .sort({regDate: 'desc'})
            .exec(function (err, coinHistory) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(coinHistory)
            })
    });
}

function updateCoin(coinId, body) {
    return new Promise((resolve, reject) => {
        Coins.findOneAndUpdate(
            {"_id": coinId},
            {$set: body},
            function(err, coin) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updateCoin done: ' + coin)
                resolve(coin)
            }
        )
    })
}

function updateBtcCoinDepositHistory(historyId, body) {
    return new Promise((resolve, reject) => {
        CoinBtcHistorys.findOneAndUpdate(
            {"_id": historyId},
            {$set: body},
            function(err, coin) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updateBtcCoinDepositHistory done: ' + coin);
                resolve(coin)
            }
        )
    })
}

function updateEtherCoinDepositHistory(historyId, body) {
    return new Promise((resolve, reject) => {
        CoinEtherHistorys.findOneAndUpdate(
            {"_id": historyId},
            {$set: body},
            function(err, coin) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updateEtherCoinDepositHistory done: ' + coin);
                resolve(coin)
            }
        )
    })
}

function updateMachCoinDepositHistory(historyId, body) {
    return new Promise((resolve, reject) => {
        CoinMachHistorys.findOneAndUpdate(
            {"_id": historyId},
            {$set: body},
            function(err, coin) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updateMachCoinDepositHistory done: ' + coin);
                resolve(coin)
            }
        )
    })
}

function updateCoinEtherWithdrawHistoryById (historyId, body) {
    return new Promise((resolve, reject) => {
        CoinEtherWithdrawHistory.findOneAndUpdate(
            {"_id": historyId
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

function updateCoinMachWithdrawHistoryById (historyId, body) {
    return new Promise((resolve, reject) => {
        CoinMachWithdrawHistory.findOneAndUpdate(
            {"_id": historyId
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

function updateCoinBtcWithdrawHistoryById (historyId, body) {
    return new Promise((resolve, reject) => {
        CoinBtcWithdrawHistory.findOneAndUpdate(
            {"_id": historyId
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

exports.getCoinById = getCoinById;
exports.listBtcDepositHistory = listBtcDepositHistory;
exports.listEtherDepositHistory = listEtherDepositHistory;
exports.listMachDepositHistory = listMachDepositHistory;
exports.listBtcWithdrawHistory = listBtcWithdrawHistory;
exports.listEtherWithdrawHistory = listEtherWithdrawHistory;
exports.listMachWithdrawHistory = listMachWithdrawHistory;
exports.updateCoin = updateCoin;
exports.updateBtcCoinDepositHistory = updateBtcCoinDepositHistory;
exports.updateEtherCoinDepositHistory = updateEtherCoinDepositHistory;
exports.updateMachCoinDepositHistory = updateMachCoinDepositHistory;
exports.updateCoinEtherWithdrawHistoryById = updateCoinEtherWithdrawHistoryById;
exports.updateCoinMachWithdrawHistoryById = updateCoinMachWithdrawHistoryById;
exports.updateCoinBtcWithdrawHistoryById = updateCoinBtcWithdrawHistoryById;