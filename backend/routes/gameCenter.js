var express = require('express');
var router = express.Router();
let crypto = require('crypto');
let md5 = require('md5');
var util = require('../utils/util');
var dbconfig = require('../config/dbconfig');
var controllerUsers = require('../controllers/users');
var controllerGameCenter = require('../controllers/gameCenter');

router.post('/login', function (req, res, next) {
    let head = JSON.parse(req.body.head);
    let body = JSON.parse(req.body.body);

    if (body.UserID != null && body.UserPW != null) {
        let key = dbconfig.gameCenter.monkeyCrashSaga.key;
        let country = dbconfig.country;
        let userID = body.UserID;
        let ingameCoin = body.IngameCoin;
        let lastStageLevel = body.LastStageLevel;
        let isLastStage = body.IsLastStage;
        let userRecordInfo = body.StagePlayInfoList;
        let service = body.service;
        let resSessionToken = util.makeToken();
        let checkmd5 = req.body.check;
        
        let userPW = crypto.createHash('sha256').update(body.UserPW).digest('base64');
        let data = {};
        data['userTag'] = userID;
        data['password'] = userPW;

        let encodemd5 = md5(req.body.body + key);
        console.log('compare md5 =>' + checkmd5 + " : " + encodemd5);

        if(checkmd5 != encodemd5) {
            let result = {
                "ConnectStatus": 202,
                "UserID": "",
                "StoredCoin": 0,
                "IngameCoin": 0,
                "GameCorrectDoneSyncTime": 0,
                "SessionToken": ""
            }

            res.status(202).send(JSON.stringify(result));
            return;
        }

        controllerUsers.getUser(country, data)
            .then(user => {
                if(user._doc.gameCenterId == undefined) {
                    let reqData = {
                        "userId": user._doc._id,
                        "total_mcs1_coin": 0
                    }
                    controllerGameCenter.add(country, reqData)
                        .then(gameCenter => {
                            let updateData = {"gameCenterId": gameCenter._doc._id, "sessionToken": resSessionToken};
                            controllerUsers.updateByUserTag(country, userID, updateData)
                                .then(() => {
                                    if(parseInt(head.Cn) > 2) {
                                        let recordInfo = {
                                            "gameCenterId": gameCenter._doc._id,
                                            "service": service,
                                            "lastStageLevel": lastStageLevel,
                                            "isLastStage": isLastStage,
                                            "userRecordInfo": userRecordInfo
                                        }

                                        controllerGameCenter.updateRecord(country, recordInfo);
                                    }

                                    let result = {
                                        "ConnectStatus": 200,
                                        "UserID": user._doc.userTag,
                                        "StoredCoin": gameCenter._doc.total_mcs1_coin,
                                        "IngameCoin": ingameCoin,
                                        "GameCorrectDoneSyncTime": 0,
                                        "SessionToken": resSessionToken
                                    }

                                    res.status(200).send(JSON.stringify(result));
                                }).catch((err) => {
                                    res.status(500).send("internal server error");
                                });
                        }).catch((err) => {
                            res.status(500).send("internal server error");
                        });
                } else {
                    controllerGameCenter.getByUserId(country, user._doc._id)
                        .then(gameCenter => {
                            let updateData = {"sessionToken": resSessionToken};
                            controllerUsers.updateByUserTag(country, userID, updateData)
                                .then(() => {
                                    if(parseInt(head.Cn) > 2) {
                                        let recordInfo = {
                                            "gameCenterId": gameCenter._doc._id,
                                            "service": head.Service,
                                            "lastStageLevel": lastStageLevel,
                                            "isLastStage": isLastStage,
                                            "userRecordInfo": userRecordInfo
                                        }

                                        controllerGameCenter.updateRecord(country, recordInfo);
                                    }

                                    let result = {
                                        "ConnectStatus": 200,
                                        "UserID": user._doc.userTag,
                                        "StoredCoin": gameCenter._doc.total_mcs1_coin,
                                        "IngameCoin": ingameCoin,
                                        "GameCorrectDoneSyncTime": 0,
                                        "SessionToken": resSessionToken
                                    }

                                    res.status(200).send(JSON.stringify(result));
                                }).catch((err) => {
                                    res.status(500).send("internal server error");
                                });
                        }).catch((err) => {
                            res.status(500).send("internal server error");
                        });
                }
            }).catch((err) => {
                console.error('err=>', err)
                let result = {
                    "ConnectStatus": 201,
                    "UserID": "",
                    "StoredCoin": 0,
                    "IngameCoin": 0,
                    "GameCorrectDoneSyncTime": 0,
                    "SessionToken": ""
                }

                res.status(201).send(JSON.stringify(result));
            });
    } else {
        res.status(500).send("please insert userID and PW.");
    }
});

router.post('/:service/send', function (req, res, next) {
    let body = JSON.parse(req.body.body);

    let key = dbconfig.gameCenter.monkeyCrashSaga.key;
    let service = req.params.service;
    let country = dbconfig.country;
    let userID = body.UserID;
    let storedCoin = body.StoredCoin;
    let ingameCoin = body.IngameCoin;
    let exchangeCoin = body.ExchangeCoin;
    let gameCorrectDoneSyncTime = body.GameCorrectDoneSyncTime;
    let resSessionToken = util.makeToken();
    let checkmd5 = req.body.check;

    controllerUsers.getByUserTag(country, userID)
        .then(user => {
            let sessionToken = user._doc.sessionToken;
            let encodemd5 = md5(req.body.body + sessionToken + key);
            console.log('compare md5 =>' + checkmd5 + " : " + encodemd5);
            if(checkmd5 != encodemd5) {
                let updateData = {"sessionToken": resSessionToken};
                controllerUsers.updateByUserTag(country, userID, updateData);

                let result = {
                    "ConnectStatus": 202,
                    "UserID": userID,
                    "StoredCoin": storedCoin,
                    "IngameCoin": 0,
                    "GameCorrectDoneSyncTime": 0,
                    "SessionToken": resSessionToken
                }
        
                res.status(202).send(JSON.stringify(result));
                return;
            }

            controllerGameCenter.getByUserId(country, user._doc._id)
                .then(gameCenter => {
                    if(gameCenter._doc.total_mcs1_coin == storedCoin) {
                        let total_mcs1_coin =  gameCenter._doc.total_mcs1_coin + exchangeCoin;
                        let reqData = {"total_mcs1_coin" : total_mcs1_coin};
                        controllerGameCenter.update(country, user._doc._id, reqData)
                            .then(() => {
                                let updateData = {"sessionToken": resSessionToken};
                                controllerUsers.updateByUserTag(country, userID, updateData)
                                    .then(() => {
                                        let reqHistory = {
                                            "service": service, 
                                            "type": "send",
                                            "userId": user._doc._id,
                                            "storedCoin": storedCoin,
                                            "ingameCoin": ingameCoin,
                                            "exchangeCoin": exchangeCoin,
                                            "saveTotalCoin": total_mcs1_coin,
                                            "regDate": util.formatDate(new Date().toString()),
                                            "sessionToken": sessionToken
                                        }

                                        controllerGameCenter.addHistory(country, reqHistory);

                                        let result = {
                                            "ConnectStatus": 200,
                                            "UserID": user._doc.userTag,
                                            "StoredCoin": total_mcs1_coin,
                                            "IngameCoin": ingameCoin - exchangeCoin,
                                            "GameCorrectDoneSyncTime": gameCorrectDoneSyncTime,
                                            "SessionToken": resSessionToken
                                        }
                            
                                        res.status(200).send(JSON.stringify(result));
                                    }).catch((err) => {
                                        res.status(500).send("No data.");
                                    });
                            }).catch((err) => {
                                res.status(500).send("No data.");
                            });
                    } else {
                        let updateData = {"sessionToken": resSessionToken};
                        controllerUsers.updateByUserTag(country, userID, updateData);

                        let result = {
                            "ConnectStatus": 201,
                            "UserID": userID,
                            "StoredCoin": storedCoin,
                            "IngameCoin": 0,
                            "GameCorrectDoneSyncTime": 0,
                            "SessionToken": resSessionToken
                        }
                
                        res.status(201).send(JSON.stringify(result));
                    }

                }).catch((err) => {
                    res.status(500).send("No data.");
                });
        }).catch((err) => {
            res.status(500).send("No data.");
        });
});

router.post('/:service/receive', function (req, res, next) {
    let body = JSON.parse(req.body.body);
    let service = req.params.service;
    let key = dbconfig.gameCenter.monkeyCrashSaga.key;
    let country = dbconfig.country;
    let userID = body.UserID;
    let storedCoin = body.StoredCoin;
    let ingameCoin = body.IngameCoin;
    let exchangeCoin = body.ExchangeCoin;
    let gameCorrectDoneSyncTime = body.GameCorrectDoneSyncTime;
    let resSessionToken = util.makeToken();
    let checkmd5 = req.body.check;

    controllerUsers.getByUserTag(country, userID)
        .then(user => {
            let sessionToken = user._doc.sessionToken;
            let encodemd5 = md5(req.body.body + sessionToken + key);
            console.log('compare md5 =>' + checkmd5 + " : " + encodemd5);
            if(checkmd5 != encodemd5) {
                let updateData = {"sessionToken": resSessionToken};
                controllerUsers.updateByUserTag(country, userID, updateData);

                let result = {
                    "ConnectStatus": 202,
                    "UserID": userID,
                    "StoredCoin": storedCoin,
                    "IngameCoin": 0,
                    "GameCorrectDoneSyncTime": 0,
                    "SessionToken": resSessionToken
                }
        
                res.status(202).send(JSON.stringify(result));
                return;
            }

            controllerGameCenter.getByUserId(country, user._doc._id)
                .then(gameCenter => {
                    if(gameCenter._doc.total_mcs1_coin == storedCoin) {
                        let total_mcs1_coin =  gameCenter._doc.total_mcs1_coin - exchangeCoin;
                        if(total_mcs1_coin < 0) {
                            let updateData = {"sessionToken": resSessionToken};
                            controllerUsers.updateByUserTag(country, userID, updateData);

                            let result = {
                                "ConnectStatus": 201,
                                "UserID": userID,
                                "StoredCoin": storedCoin,
                                "IngameCoin": 0,
                                "GameCorrectDoneSyncTime": 0,
                                "SessionToken": resSessionToken
                            }
                    
                            res.status(201).send(JSON.stringify(result));
                            return;                           
                        }

                        let reqData = {"total_mcs1_coin" : total_mcs1_coin};
                        controllerGameCenter.update(country, user._doc._id, reqData)
                            .then(() => {
                                let updateData = {"sessionToken": resSessionToken};
                                controllerUsers.updateByUserTag(country, userID, updateData)
                                    .then(() => {
                                        let reqHistory = {
                                            "service": service, 
                                            "type": "receive",
                                            "userId": user._doc._id,
                                            "storedCoin": storedCoin,
                                            "ingameCoin": ingameCoin,
                                            "exchangeCoin": exchangeCoin,
                                            "saveTotalCoin": total_mcs1_coin,
                                            "regDate": util.formatDate(new Date().toString()),
                                            "sessionToken": sessionToken
                                        }

                                        controllerGameCenter.addHistory(country, reqHistory);
                                        
                                        let result = {
                                            "ConnectStatus": 200,
                                            "UserID": user._doc.userTag,
                                            "StoredCoin": total_mcs1_coin,
                                            "IngameCoin": ingameCoin + exchangeCoin,
                                            "GameCorrectDoneSyncTime": gameCorrectDoneSyncTime,
                                            "SessionToken": resSessionToken
                                        }
                            
                                        res.status(200).send(JSON.stringify(result));
                                    }).catch((err) => {
                                        res.status(500).send("No data.");
                                    });
                            }).catch((err) => {
                                res.status(500).send("No data.");
                            });
                    } else {
                        let updateData = {"sessionToken": resSessionToken};
                        controllerUsers.updateByUserTag(country, userID, updateData);

                        let result = {
                            "ConnectStatus": 201,
                            "UserID": userID,
                            "StoredCoin": storedCoin,
                            "IngameCoin": 0,
                            "GameCorrectDoneSyncTime": 0,
                            "SessionToken": updateData
                        }
                
                        res.status(201).send(JSON.stringify(result));
                    }

                }).catch((err) => {
                    res.status(500).send("No data.");
                });
        }).catch((err) => {
            res.status(500).send("No data.");
        });
});

module.exports = router;