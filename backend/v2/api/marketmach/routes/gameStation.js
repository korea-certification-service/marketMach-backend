/**
 * 게임스테이션 API(현재 사용 안함)
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-03
 */
var express = require('express');
var router = express.Router();
let crypto = require('crypto');
let md5 = require('md5');
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let logger = require('../../../utils/log');
let token = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')
let serviceGameStation = require('../../../service/gameStation');
let serviceGameStationHistory = require('../../../service/gameStationHistory');
let serviceGameStationRecords = require('../../../service/gameStationRecords');
let serviceGameStationRecordHistorys = require('../../../service/gameStationRecordHistorys');
let serviceGameStationExchangeHistorys = require('../../../service/gameStationExchangeHistorys');
let serviceUsers = require('../../../service/users');

router.post('/list', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let condition = {};
    
    let option = req.body.option;
    let country = dbconfig.country;
    serviceGameStation.count(country, condition, option)
    .then(count => {
        serviceGameStation.list(country, condition, option)
        .then(list => {
            bitwebResponse.code = 200;
            let resData = {
                "successYn": "Y",
                "count": count,
                "list": list
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, resData);
            bitwebResponse.data = resData;

            let jsonResult = bitwebResponse.create();

            jsonResult['pageIdx'] = option.pageIdx;
            jsonResult['perPage'] = option.perPage;

            res.status(200).send(jsonResult);
        }).catch((err) => {
            console.error('list gameStationInfo error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, err);
    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        });
    }).catch((err) => {
        console.error('count gameStationInfo error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    });
});

router.get('/detail/:gameCenterId', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let condition = {
        "_id" : req.params.gameCenterId
    }

    serviceGameStation.detail(country, condition)
    .then(gameStationInfo => {
        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "gameStationInfo": gameStationInfo
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.data = gameStationInfo;
        res.status(200).send(bitwebResponse.create());
    }).catch((err) => {
        console.error('detail gameStationInfo error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//게임스테이션 로그인
router.post('/login', token.checkInternalToken, async function (req, res, next) {
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
        let deviceId = body.deviecId == undefined ? -99 : body.deviecId;
        let resSessionToken = util.makeToken();
        let checkmd5 = req.body.check;
        
        let userPW = crypto.createHash('sha256').update(body.UserPW).digest('base64');
        let condition = {};
        condition['userTag'] = userID;
        condition['password'] = userPW;

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
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, "not match md5.");
            res.status(202).send(JSON.stringify(result));
            return;
        }

        try {
            let user = await serviceUsers.detail(country, condition);
            if(user._doc.gameCenterId == undefined) {
                let reqData = {
                    "userId": user._doc._id,
                    "total_mcs1_coin": 0,
                    "regDate":util.formatDate(new Date().toString()),
                    "loginDate":util.formatDate(new Date().toString())
                }
                let addGameStation = await serviceGameStation.add(country, reqData);                
                
                let updateData = {"gameCenterId": addGameStation._doc._id, "sessionToken": resSessionToken};
                let updatedUser = await serviceUsers.modify(country, {"userTag": userID}, updateData);
                if(parseInt(head.Cn) > 2) {
                    let recordInfo = {
                        "gameCenterId": addGameStation._doc._id,
                        "service": service,
                        "lastStageLevel": lastStageLevel,
                        "isLastStage": isLastStage,
                        "userRecordInfo": userRecordInfo,
                        "deviceId": deviceId,
                        "cn":head.Cn,
                        "regDate": util.formatDate(new Date().toString())
                    }

                    let addGameRecord = await serviceGameStationRecords.add(country, recordInfo);
                    let addGameRecordHistory = await serviceGameStationRecordHistorys.add(country, recordInfo);
                }

                let result = {
                    "ConnectStatus": 200,
                    "UserID": user._doc.userTag,
                    "StoredCoin": addGameStation._doc.total_mcs1_coin,
                    "IngameCoin": ingameCoin,
                    "GameCorrectDoneSyncTime": 0,
                    "SessionToken": resSessionToken
                }

                let resData = {
                    "successYn": "Y",
                    "addGameStation": addGameStation,
                    "updatedUser": updatedUser
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, condition, resData);
                res.status(200).send(JSON.stringify(result));                
            } else {
                let gameStationInfo = await serviceGameStation.detail(country, {"gameCenterId": user._doc.gameCenterId});
                let updateData = {"sessionToken": resSessionToken};
                let updatedUser = await serviceUsers.modify(country, {"userTag": userID}, updateData);
                if(parseInt(head.Cn) > 2) {
                    let recordInfo = {
                        "gameCenterId": gameStationInfo._doc._id,
                        "service": head.Service,
                        "lastStageLevel": lastStageLevel,
                        "isLastStage": isLastStage,
                        "userRecordInfo": userRecordInfo,
                        "regDate": util.formatDate(new Date().toString())
                    }
                    
                    let addGameRecord = await serviceGameStationRecords.add(country, recordInfo);
                    let addGameRecordHistory = await serviceGameStationRecordHistorys.add(country, recordInfo);                    
                }            
                let updatedGameStation = await serviceGameStation.modify(country, {"userId": user._doc._id}, {"loginDate":util.formatDate(new Date().toString())});

                let result = {
                    "ConnectStatus": 200,
                    "UserID": user._doc.userTag,
                    "StoredCoin": gameStationInfo._doc.total_mcs1_coin,
                    "IngameCoin": ingameCoin,
                    "GameCorrectDoneSyncTime": 0,
                    "SessionToken": resSessionToken
                }

                let resData = {
                    "successYn": "Y",
                    "gameStationInfo": gameStationInfo,
                    "updatedGameStation": updatedGameStation,
                    "updatedUser": updatedUser
                }

                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, resData);
                res.status(200).send(JSON.stringify(result));        
            }
        } catch (err) {
            console.error('err=>', err)
            let result = {
                "ConnectStatus": 201,
                "UserID": "",
                "StoredCoin": 0,
                "IngameCoin": 0,
                "GameCorrectDoneSyncTime": 0,
                "SessionToken": ""
            }

            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
            res.status(201).send(JSON.stringify(result));
        }
    } else {
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, "failed.");
        res.status(500).send("please insert userID and PW.");
    }
});

module.exports = router;