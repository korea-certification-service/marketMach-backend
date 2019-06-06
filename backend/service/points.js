let db = require('../../utils/db');
let bitwebPoints = require('./impl/points');
let bitwebUsers = require('./impl/user');
let bitwebItems = require('./impl/items');
let util = require('../../utils/util');


function listPointTrade(req) {
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
            .then(() => bitwebPoints.listPointTrade(body,data))
            .then((tradePoints) => {
                console.log('result=>' , tradePoints);
                if(tradePoints.length > 0) {
                    let itemIds = [];
                    for (var i in tradePoints) {
                        itemIds.push(tradePoints[i]._doc.item._id);
                    }
                    bitwebItems.getItemsByIds(itemIds)
                        .then((items) => {
                            //let result = Object.assign([], tradePoints);
                            for (var i in tradePoints) {
                                let selIndex = items.findIndex(function (group) {
                                    console.log(group._doc._id + '', tradePoints[i]._doc.item._id + '');
                                    return (group._doc._id + '') == (tradePoints[i]._doc.item._id + '');
                                })

                                tradePoints[i]['_doc']['item'] = items[selIndex];
                            }
                            resolve(tradePoints)
                        })
                } else {
                    resolve(tradePoints)
                }
            }).catch((err) => {
            reject(err)
        })
    })
}

function listPointHistorys(country, body, option) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(()=> {
            bitwebPoints.getPointHistorys(body, option)
            .then(pointHistorys => {
                let pointIds = [];
                for (var i in pointHistorys) {
                    let selIndex = pointIds.findIndex(function(group) {
                        return group == pointHistorys[i]._doc.pointId;
                    });
                    if(selIndex == -1) {
                        pointIds.push(pointHistorys[i]._doc.pointId);
                    }
                }
                bitwebUsers.getUserByPointIds(pointIds)
                .then(users => {
                    for (var i in pointHistorys) {
                        let selIndex = users.findIndex(function(group) {
                            return group._doc.pointId.toString() == pointHistorys[i]._doc.pointId;
                        });
                        pointHistorys[i]['_doc']['user'] = users[selIndex];
                    }

                    bitwebPoints.getPointsByIds(pointIds)
                    .then((points) => {
                        for (var i in pointHistorys) {
                            let selIndex = points.findIndex(function(group) {
                                return group._doc._id.toString() == pointHistorys[i]._doc.pointId;
                            });
                            pointHistorys[i]['_doc']['pointInfo'] = points[selIndex];
                        }
                        resolve(pointHistorys);
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
}

function updateWithdrawStatus(country, pointId, body) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => {
                bitwebPoints.getPointById(pointId)
                    .then(point => {
                        let data = {
                            "total_point": point._doc.total_point + parseInt(body.point)
                        };
                        if(body.type == "withdraw") {
                            let user_point = point._doc.total_point - parseInt(body.point);
                            if(user_point <= 0) {
                                let result = {
                                    "code":"E001",
                                    "msg":"포인트 출금 금액이 가지고 있는 금액보다 적습니다."
                                }

                                console.log('result=>' , result);
                                resolve(result);
                                return;
                            }
                            data = {
                                "total_point": user_point
                            };
                        }

                        bitwebPoints.updatePointById(pointId, data)
                            .then(() => {
                                let pointHisory = {
                                    "pointId": pointId,
                                    "point": parseInt(body.point),
                                    "status": body.status
                                }
                                bitwebPoints.updatePointHistory(body.id, pointHisory)
                                    .then(history => {
                                        //fee history 저장
                                        let feeHistory = {
                                            userId: body.userId,
                                            currency: body.amountCurrency,
                                            type: body.type,
                                            amount: history._doc.type == "deposit" ? parseInt(history._doc.amount) * history._doc.fee : parseInt(history._doc.point) * history._doc.fee,
                                            fee: history._doc.fee,
                                            regDate: util.formatDate(new Date().toString())  
                                        }
                                        bitwebPoints.createFeeHistory(feeHistory);
                                        
                                        let message = "포인트 이체가 완료 되었습니다.";
                                        let result = {
                                            "code":"Success",
                                            "msg":message
                                        }

                                        console.log('result=>' , result);
                                        resolve(result);
                                    }).catch((err) => {
                                    reject(err)
                                });
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
}

function updatePointsTrade(tradePointId, data) {
    return new Promise((resolve, reject) => {
        db.connectDB()
            .then(() => bitwebPoints.getTradePointById(tradePointId)
                .then((tradePoint) => {
                    bitwebUsers.getByUserId(tradePoint.from_userId)
                        .then((user) => {
                            let pointId = user._doc.pointId;
                            bitwebPoints.getPointById(pointId)
                                .then((point) => {
                                    let total_point = point._doc.total_point + tradePoint._doc.item.total_point;
                                    let data = {"total_point": total_point};
                                    bitwebPoints.updatePoints(pointId, data)
                                        .then(() => {
                                            let data1 = {"status": 3};
                                            bitwebItems.updateItemStatus(tradePoint._doc.item._id, data1)
                                                .then(() => {
                                                    let data2 = {"status": true};
                                                    bitwebPoints.updatePointHistory(pointId, data2)
                                                        .then(()=>{
                                                            bitwebPoints.updatePointsTrade(tradePointId, data)
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
                                                }).catch((err) => {
                                                reject(err)
                                            })
                                        }).catch((err) => {
                                        reject(err)
                                    })
                                })
                        })
                })
            )
    })
}

function getTradePointById(tradePointId) {
    return new Promise((resolve, reject) => {
        db.connectDB()
            .then(() => bitwebPoints.getTradePointById(tradePointId)
                .then((tradePoint) => {
                    console.log('result=>' , tradePoint);
                    resolve(tradePoint);
                })
                .catch((err) => {
                    reject(err)
                })
            )
    })
}



function deletePointsTrade(tradePointId) {
    return new Promise((resolve, reject) => {
        db.connectDB()
            .then(() => bitwebPoints.getTradePointById(tradePointId)
                .then((tradePoint) => {
                    bitwebUsers.getByUserId(tradePoint.to_userId)
                        .then((user) => {
                            let pointId = user._doc.pointId;
                            bitwebPoints.getPointById(pointId)
                                .then((point) => {
                                    let total_point = point._doc.total_point + tradePoint._doc.item.total_point;
                                    let data = {"total_point": total_point};
                                    bitwebPoints.updatePoints(pointId, data)
                                        .then(() => {
                                            data = {"status": 0, "tradePointId": ""};
                                            bitwebItems.updateItemStatus(tradePoint._doc.item._id, data)
                                                .then(() => {
                                                    bitwebPoints.deletePointHistory(pointId)
                                                        .then(()=> {
                                                            bitwebPoints.deletePointsTrade(tradePointId)
                                                                .then((result) => {
                                                                    console.log('result=>', tradePoint);
                                                                    resolve(tradePoint);
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

                        })
                })
            )
    })
}

exports.listPointTrade = listPointTrade;
exports.listPointHistorys = listPointHistorys;
exports.updateWithdrawStatus = updateWithdrawStatus;
exports.updatePointsTrade = updatePointsTrade;
exports.deletePointsTrade = deletePointsTrade;
exports.getTradePointById = getTradePointById;