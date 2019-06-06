let db = require('../../utils/db');
let bitwebUser = require('./impl/user');
let bitwebCoins = require('./impl/coins');
let util = require('../../utils/util')
let ObjectId = require('mongoose').Types.ObjectId;

function listCoinDepositHistory(req) {
    return new Promise((resolve, reject) => {
        let country = req.body.country;
        let coinType = req.body.coinType;
        let userTag = req.body.userTag;
        let data = {
            "perPage": 20,
            "pageIdx": 0
        };
        let body = {};

        db.connectDB(country)
            .then(() => {
                if(userTag == undefined) {
                    if (coinType == "btc") {
                        bitwebCoins.listBtcDepositHistory(body)
                            .then((historys) => {
                                let arr_coinId = [];
                                for(var i in historys) {
                                    arr_coinId.push(new ObjectId(historys[i]._doc.coinId));
                                }
                                bitwebUser.getUserByCoinIds(arr_coinId)
                                    .then((users) => {
                                        for(var i in historys) {
                                            let findIndex = users.findIndex((group) => {
                                                return group._doc.coinId.toString() == historys[i]._doc.coinId;
                                            });
                                            historys[i]._doc['user'] = users[findIndex];
                                        }

                                        console.log('result=>', historys);
                                        resolve(historys);
                                    }).catch((err) => {
                                        reject(err)
                                    })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    } else if (coinType == "ether") {
                        bitwebCoins.listEtherDepositHistory(body)
                            .then((historys) => {
                                let arr_coinId = [];
                                for(var i in historys) {
                                    arr_coinId.push(new ObjectId(historys[i]._doc.coinId));
                                }
                                bitwebUser.getUserByCoinIds(arr_coinId)
                                    .then((users) => {
                                        for(var i in historys) {
                                            let findIndex = users.findIndex((group) => {
                                                return group._doc.coinId == historys[i]._doc.coinId;
                                            });
                                            historys[i]._doc['user'] = users[findIndex];
                                        }

                                        console.log('result=>', historys);
                                        resolve(historys);
                                    }).catch((err) => {
                                    reject(err)
                                })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    } else {
                        bitwebCoins.listMachDepositHistory(body)
                            .then((historys) => {
                                let arr_coinId = [];
                                for(var i in historys) {
                                    arr_coinId.push(new ObjectId(historys[i]._doc.coinId));
                                }
                                bitwebUser.getUserByCoinIds(arr_coinId)
                                    .then((users) => {
                                        for(var i in historys) {
                                            let findIndex = users.findIndex((group) => {
                                                return group._doc.coinId == historys[i]._doc.coinId;
                                            });
                                            historys[i]._doc['user'] = users[findIndex];
                                        }

                                        console.log('result=>', historys);
                                        resolve(historys);
                                    }).catch((err) => {
                                    reject(err)
                                })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    }
                } else {
                    body['userTag'] = userTag;
                    bitwebUser.listUsers(body, data)
                        .then((user) =>{
                            delete body['userTag'];
                            body['coinId'] = user[0]._doc.coinId.toString();
                            if (coinType == "btc") {
                                bitwebCoins.listBtcDepositHistory(body)
                                    .then((historys) => {
                                        for(var i in historys) {
                                            historys[i]._doc['user'] = user[0];
                                        }
                                        console.log('result=>', historys);
                                        resolve(historys);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            } else if (coinType == "ether") {
                                bitwebCoins.listEtherDepositHistory(body)
                                    .then((historys) => {
                                        for(var i in historys) {
                                            historys[i]._doc['user'] = user[0];
                                        }
                                        console.log('result=>', historys);
                                        resolve(historys);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            } else {
                                bitwebCoins.listMachDepositHistory(body)
                                    .then((historys) => {
                                        for(var i in historys) {
                                            historys[i]._doc['user'] = user[0];
                                        }
                                        console.log('result=>', historys);
                                        resolve(historys);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            }
                        }).catch((err) => {
                            reject(err)
                        })

                }
            })
    })
}

function getCoinById(country, coinId) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebCoins.getCoinById(coinId)
                .then((coin) => {
                    console.log('result=>' , coin);
                    resolve(coin);
                })
                .catch((err) => {
                    reject(err)
                })
            )
    })
}

function listCoinWithdrawHistory(req) {
    return new Promise((resolve, reject) => {
        let country = req.body.country;
        let coinType = req.body.coinType;
        let userTag = req.body.userTag;
        let data = {
            "perPage": 20,
            "pageIdx": 0
        };
        let body = {};

        db.connectDB(country)
            .then(() => {
                if(userTag == undefined) {
                    if (coinType == "btc") {
                        bitwebCoins.listBtcWithdrawHistory(body)
                            .then((historys) => {
                                let arr_coinId = [];
                                for(var i in historys) {
                                    arr_coinId.push(new ObjectId(historys[i]._doc.coinId));
                                }
                                bitwebUser.getUserByCoinIds(arr_coinId)
                                    .then((users) => {
                                        for(var i in historys) {
                                            let findIndex = users.findIndex((group) => {
                                                return group._doc.coinId.toString() == historys[i]._doc.coinId;
                                            });
                                            historys[i]._doc['user'] = users[findIndex];
                                        }

                                        console.log('result=>', historys);
                                        resolve(historys);
                                    }).catch((err) => {
                                    reject(err)
                                })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    } else if (coinType == "ether") {
                        bitwebCoins.listEtherWithdrawHistory(body)
                            .then((historys) => {
                                let arr_coinId = [];
                                for(var i in historys) {
                                    arr_coinId.push(new ObjectId(historys[i]._doc.coinId));
                                }
                                bitwebUser.getUserByCoinIds(arr_coinId)
                                    .then((users) => {
                                        for(var i in historys) {
                                            let findIndex = users.findIndex((group) => {
                                                return group._doc.coinId == historys[i]._doc.coinId;
                                            });
                                            historys[i]._doc['user'] = users[findIndex];
                                        }

                                        console.log('result=>', historys);
                                        resolve(historys);
                                    }).catch((err) => {
                                    reject(err)
                                })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    } else {
                        bitwebCoins.listMachWithdrawHistory(body)
                            .then((historys) => {
                                let arr_coinId = [];
                                for(var i in historys) {
                                    arr_coinId.push(new ObjectId(historys[i]._doc.coinId));
                                }
                                bitwebUser.getUserByCoinIds(arr_coinId)
                                    .then((users) => {
                                        for(var i in historys) {
                                            let findIndex = users.findIndex((group) => {
                                                return group._doc.coinId == historys[i]._doc.coinId;
                                            });
                                            historys[i]._doc['user'] = users[findIndex];
                                        }

                                        console.log('result=>', historys);
                                        resolve(historys);
                                    }).catch((err) => {
                                    reject(err)
                                })
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    }
                } else {
                    body['userTag'] = userTag;
                    bitwebUser.listUsers(body, data)
                        .then((user) =>{
                            delete body['userTag'];
                            body['coinId'] = user[0]._doc.coinId.toString();
                            if (coinType == "btc") {
                                bitwebCoins.listBtcWithdrawHistory(body)
                                    .then((historys) => {
                                        for(var i in historys) {
                                            historys[i]._doc['user'] = user[0];
                                        }
                                        console.log('result=>', historys);
                                        resolve(historys);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            } else if (coinType == "ether") {
                                bitwebCoins.listEtherWithdrawHistory(body)
                                    .then((historys) => {
                                        for(var i in historys) {
                                            historys[i]._doc['user'] = user[0];
                                        }
                                        console.log('result=>', historys);
                                        resolve(historys);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            } else {
                                bitwebCoins.listMachWithdrawHistory(body)
                                    .then((historys) => {
                                        for(var i in historys) {
                                            historys[i]._doc['user'] = user[0];
                                        }
                                        console.log('result=>', historys);
                                        resolve(historys);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            }
                        }).catch((err) => {
                        reject(err)
                    })

                }
            })
    })
}



function updateBtcCoinDepositHistory(req) {
    return new Promise((resolve, reject) => {
        let historyId = req.params.historyId;
        let country = req.body.country;
        let coinId = req.body.coinId;
        let body = req.body;
        body['completeDate'] = util.formatDate(new Date());

        db.connectDB(country)
            .then(() =>
                bitwebCoins.getCoinById(coinId)
                    .then((coin)=> {
                        bitwebCoins.updateCoin(coinId, {"total_mach": coin._doc.total_mach + parseFloat(req.body.mach)})
                            .then(() => {
                                bitwebCoins.updateBtcCoinDepositHistory(historyId, body)
                                    .then((btcHistory) => {
                                        console.log('result=>' , btcHistory);
                                        resolve(btcHistory);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            }).catch((err) => {
                            reject(err)
                        })
                    })
            )
    })
}

function updateEtherCoinDepositHistory(req) {
    return new Promise((resolve, reject) => {
        let historyId = req.params.historyId;
        let country = req.body.country;
        let coinId = req.body.coinId;
        let body = req.body;
        body['completeDate'] = util.formatDate(new Date());

        db.connectDB(country)
            .then(() =>
                bitwebCoins.getCoinById(coinId)
                    .then((coin)=> {
                        bitwebCoins.updateCoin(coinId, {"total_mach": coin._doc.total_mach + parseFloat(req.body.mach)})
                            .then(() => {
                                bitwebCoins.updateEtherCoinDepositHistory(historyId, body)
                                    .then((btcHistory) => {
                                        console.log('result=>' , btcHistory);
                                        resolve(btcHistory);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            }).catch((err) => {
                            reject(err)
                        })
                    })
            )
    })
}

function updateMachCoinDepositHistory(req) {
    return new Promise((resolve, reject) => {
        let historyId = req.params.historyId;
        let country = req.body.country;
        let coinId = req.body.coinId;
        let body = req.body;
        body['completeDate'] = util.formatDate(new Date());

        db.connectDB(country)
            .then(() =>
                bitwebCoins.getCoinById(coinId)
                    .then((coin)=> {
                        bitwebCoins.updateCoin(coinId, {"total_mach": coin._doc.total_mach + parseFloat(req.body.mach)})
                            .then(() => {
                                bitwebCoins.updateMachCoinDepositHistory(historyId, body)
                                    .then((btcHistory) => {
                                        console.log('result=>' , btcHistory);
                                        resolve(btcHistory);
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            }).catch((err) => {
                            reject(err)
                        })
                    })
            )
    })
}

function updateTotalCoin(country, coinId, data) {
    return new Promise((resolve , reject) => {

        db.connectDB(country)
            .then(() => bitwebCoins.updateCoin(coinId, data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function updateCoinWithdrawHistoryById(country, historyId, data) {
    return new Promise((resolve , reject) => {
        db.connectDB(country)
            .then(() => {

                if (data['coinType'] == "ether") {
                    bitwebCoins.updateCoinEtherWithdrawHistoryById(historyId, data)
                        .then((result) => {
                            console.log('result=>' , result);
                            resolve(result)
                        }).catch((err) => {
                        reject(err)
                    })
                } else if (data['coinType'] == "mach") {
                    bitwebCoins.updateCoinMachWithdrawHistoryById(historyId, data)
                        .then((result) => {
                            console.log('result=>' , result);
                            resolve(result)
                        }).catch((err) => {
                        reject(err)
                    })
                } else if (data['coinType'] == "btc") {
                    bitwebCoins.updateCoinBtcWithdrawHistoryById(historyId, data)
                        .then((result) => {
                            console.log('result=>' , result);
                            resolve(result)
                        }).catch((err) => {
                        reject(err)
                    })
                }
            })

    })
}

function updateCoinHistoryStatusById(country, historyId, history) {
    return new Promise((resolve , reject) => {

        var data = {};
        data['completeDate'] = util.formatDate(new Date().toLocaleString('ko-KR'))
        data['status'] = true;
        data['completedPrice'] = history.completedPrice;

        db.connectDB(country)
            .then(() => {

                if (history['type'] == "ether_withdraw") {
                    bitwebCoins.updateCoinEtherWithdrawHistoryById(historyId, data)
                        .then((result) => {
                            console.log('result=>' , result);
                            resolve(result)
                        }).catch((err) => {
                        reject(err)
                    })
                } else if (history['type'] == "mach_withdraw") {
                    bitwebCoins.updateCoinMachWithdrawHistoryById(historyId, data)
                        .then((result) => {
                            console.log('result=>' , result);
                            resolve(result)
                        }).catch((err) => {
                        reject(err)
                    })
                } else if (history['type'] == "btc_withdraw") {
                    bitwebCoins.updateCoinBtcWithdrawHistoryById(historyId, data)
                        .then((result) => {
                            console.log('result=>' , result);
                            resolve(result)
                        }).catch((err) => {
                        reject(err)
                    })
                }
            })

    })
}

exports.listCoinDepositHistory = listCoinDepositHistory;
exports.listCoinWithdrawHistory = listCoinWithdrawHistory;
exports.getCoinById = getCoinById;
exports.updateBtcCoinDepositHistory = updateBtcCoinDepositHistory;
exports.updateEtherCoinDepositHistory = updateEtherCoinDepositHistory;
exports.updateMachCoinDepositHistory = updateMachCoinDepositHistory;
exports.updateTotalCoin = updateTotalCoin;
exports.updateCoinWithdrawHistoryById = updateCoinWithdrawHistoryById;
exports.updateCoinHistoryStatusById = updateCoinHistoryStatusById;