var db = require('../../utils/db');
var bitwebVtrs = require('./impl/vtrs');
var bitwebUsers = require('./impl/user');
var bitwebCoins = require('./impl/coins');
var bitwebItems = require('./impl/items');

function listVtrs(req) {
    let country = req.body.country == undefined ? "KR" : req.body.country;
    let itemId = req.body.itemId;
    let perPage = req.body.perPage == undefined ? 20 : req.body.perPage;
    let pageIdx = req.body.pageIdx == undefined ? 0 : req.body.pageIdx;
    let data = {
        "perPage": perPage,
        "pageIdx": pageIdx
    }
    let body = {};
    if(itemId !== undefined) {
        body = {
            $and: [ {"item._id": itemId} ]
        };
    }

    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebVtrs.listVtrs(body, data))
            .then((vtrs) => {
                let itemIds = [];
                for(var i in vtrs) {
                    itemIds.push(vtrs[i]._doc.item._id);
                }
                bitwebItems.getItemsByIds(itemIds)
                    .then((items) => {
                        //let result = Object.assign([], tradePoints);
                        for(var i in vtrs) {
                            let selIndex = items.findIndex(function(group){
                                console.log(group._doc._id + '', vtrs[i]._doc.item._id + '');
                                return (group._doc._id + '') == (vtrs[i]._doc.item._id+ '');
                            })

                            vtrs[i]['_doc']['item'] = items[selIndex];
                        }
                        resolve(vtrs)
                    })
            }).catch((err) => {
            reject(err)
        })
    })
}

function getVtrById(country, vtrId) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebVtrs.getVtrById(vtrId)
                .then((vtr) => {
                    console.log('result=>' , vtr);
                    resolve(vtr);
                })
                .catch((err) => {
                    reject(err)
                })
            )
    })
}

function updateVtrs(country, vtrId, data, buy_status) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebVtrs.getVtrById(vtrId)
                .then((vtr) => {
                    if(buy_status != undefined) {
                        bitwebUsers.getByUserId(vtr._doc.from_userId)
                            .then((user) => {
                                let coinId = user._doc.coinId;
                                bitwebCoins.getCoinById(coinId)
                                    .then((coin) => {
                                        let total_mach = coin._doc.total_mach + vtr._doc.item.total_price;
                                        let data1 = {"total_mach": total_mach};
                                        bitwebCoins.updateCoin(coinId, data1)
                                            .then(() => {
                                                let data2 = {"status": 6};
                                                bitwebItems.updateItemStatus(vtr._doc.item._id, data2)
                                                    .then(() => {
                                                        bitwebVtrs.updateVtr(vtrId, data)
                                                            .then((result) => {
                                                                console.log('result=>', result);
                                                                resolve(result)
                                                            })
                                                            .catch((err) => {
                                                                reject(err)
                                                            })
                                                    }).catch((err) => {
                                                    reject(err)
                                                })
                                            })
                                    })
                            })
                    } else {
                        bitwebUsers.getByUserId(vtr._doc.to_userId)
                            .then((to_user) => {
                                bitwebCoins.getCoinById(to_user._doc.coinId)
                                    .then((coin1) => {
                                        let total_mach1 = coin1._doc.total_mach - vtr._doc.item.total_price;
                                        let data2 = {"total_mach": total_mach1};
                                        bitwebCoins.updateCoin(to_user._doc.coinId, data2)
                                            .then(() => {
                                                bitwebUsers.getByUserId(vtr._doc.from_userId)
                                                    .then((user) => {
                                                        let coinId = user._doc.coinId;
                                                        bitwebCoins.getCoinById(coinId)
                                                            .then((coin) => {
                                                                let total_mach = coin._doc.total_mach + vtr._doc.item.total_price;
                                                                let data1 = {"total_mach": total_mach};
                                                                bitwebCoins.updateCoin(coinId, data1)
                                                                    .then(() => {
                                                                        let data2 = {"status": 6};
                                                                        bitwebItems.updateItemStatus(vtr._doc.item._id, data2)
                                                                            .then(() => {
                                                                                bitwebVtrs.updateVtr(vtrId, data)
                                                                                    .then((result) => {
                                                                                        console.log('result=>', result);
                                                                                        resolve(result)
                                                                                    })
                                                                                    .catch((err) => {
                                                                                        reject(err)
                                                                                    })
                                                                            }).catch((err) => {
                                                                            reject(err)
                                                                        })
                                                                    })
                                                            })
                                                    })
                                            })
                                    })
                            })
                    }
                })
            )
    })
}

function deleteVtrs(country, vtrId) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebVtrs.getVtrById(vtrId)
                .then((vtr) => {
                    bitwebUsers.getByUserId(vtr._doc.to_userId)
                        .then((user) => {
                            if(vtr._doc.buy_status != undefined) {
                                let coinId = user._doc.coinId;
                                bitwebCoins.getCoinById(coinId)
                                    .then((coin) => {
                                        let total_mach = coin._doc.total_mach + vtr._doc.item.total_price;
                                        let data1 = {"total_mach": total_mach};
                                        bitwebCoins.updateCoin(coinId, data1)
                                            .then(() => {
                                                let data2 = {"status": 0};
                                                bitwebItems.updateItemStatus(vtr._doc.item._id, data2)
                                                    .then(() => {
                                                        bitwebVtrs.deleteVtr(vtrId)
                                                            .then(()=> {
                                                                bitwebVtrs.deleteVtrTempByItemId(vtr._doc.item._id)
                                                                    .then(()=> {
                                                                        console.log('result=>', vtr);
                                                                        resolve(vtr);
                                                                    }).catch((err) => {
                                                                    reject(err)
                                                                })
                                                            }).catch((err) => {
                                                            reject(err)
                                                        })
                                                    }).catch((err) => {
                                                    reject(err)
                                                })
                                            }).catch((err) => {
                                            reject(err)
                                        })
                                    })
                            } else {
                                let data2 = {"status": 0};
                                bitwebItems.updateItemStatus(vtr._doc.item._id, data2)
                                    .then(() => {
                                        bitwebVtrs.deleteVtr(vtrId)
                                            .then(()=> {
                                                bitwebVtrs.deleteVtrTempByItemId(vtr._doc.item._id)
                                                    .then(()=> {
                                                        console.log('result=>', vtr);
                                                        resolve(vtr);
                                                    }).catch((err) => {
                                                    reject(err)
                                                })
                                            }).catch((err) => {
                                            reject(err)
                                        })
                                    }).catch((err) => {
                                    reject(err)
                                })
                            }

                        })
                })
            )
    })
}


exports.listVtrs = listVtrs;
exports.getVtrById = getVtrById;
exports.updateVtrs = updateVtrs;
exports.deleteVtrs = deleteVtrs;