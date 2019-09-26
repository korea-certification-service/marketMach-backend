/**
 * MAIN API
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-25
 */
var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../../utils/BitwebResponse');
let dbconfig = require('../../../../../config/dbconfig');
let logger = require('../../../utils/log');
let tokens = require('../../../utils/token');
let serviceItem = require('../../../service/items');
let serviceCommunity = require('../../../service/communitys');
let serviceNotices = require('../../../service/notice');
let serviceBanner = require('../../../service/banner');

router.get('/all', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "category":"game",
        "trade_type":"buy",
        "status": 0        
    };
    let option = {
        "pageIdx": 0,
        "perPage": 5
    }

    let otherCondition = {};
    let otherOption = {
        "pageIdx": 0,
        "perPage": 3
    }
    
    if(req.body.param.country == "KR") {
        condition['country'] = {$exists:false};        
    }
    
    serviceItem.list(country, condition, option)
    .then(gameBuys => {
        condition['trade_type'] = "sell";
        serviceItem.list(country, condition, option)
        .then(gameSells => {
            condition['category'] = "etc";
            condition['trade_type'] = "sell";
            option['perPage'] = 7;
            serviceItem.list(country, condition, option)
            .then(etcSells => {
                condition['category'] = "otc";
                condition['trade_type'] = "buy";
                option['perPage'] = 5;
                serviceItem.list(country, condition, option)
                .then(otcBuys => {
                    condition['trade_type'] = "sell";
                    serviceItem.list(country, condition, option)
                    .then(otcSells => {
                        serviceCommunity.list(country, otherCondition, otherOption)
                        .then(communitys => {
                            otherOption['perPage'] = 5;
                            serviceNotices.list(country, otherCondition, otherOption)
                            .then(notices => {
                                let resData = {
                                    "game_buys" : gameBuys,
                                    "game_sells" : gameSells,
                                    "etc_buys" : etcBuys,
                                    "etc_sells" : etcSells,
                                    "otc_buys" : otcBuys,
                                    "otc_sells" : otcSells,
                                    "communitys": communitys,
                                    "notices": notices
                                }
                                bitwebResponse.code = 200;
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, {}, resData);
                                bitwebResponse.data = resData;
                                let jsonResult = bitwebResponse.create();
                                res.status(200).send(jsonResult);
                            }).catch((err) => {
                                console.error('get notices error =>', err);
                                let resErr = "처리중 에러 발생";
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, otherCondition, err);
                        
                                bitwebResponse.code = 500;
                                bitwebResponse.message = resErr;
                                res.status(500).send(bitwebResponse.create())
                            });
                        }).catch((err) => {
                            console.error('get communitys error =>', err);
                            let resErr = "처리중 에러 발생";
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, otherCondition, err);
                    
                            bitwebResponse.code = 500;
                            bitwebResponse.message = resErr;
                            res.status(500).send(bitwebResponse.create())
                        });
                    }).catch((err) => {
                        console.error('get sell otcs error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, condition, err);
                
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    });
                }).catch((err) => {
                    console.error('get buy otcs error =>', err);
                    let resErr = "처리중 에러 발생";
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, condition, err);
            
                    bitwebResponse.code = 500;
                    bitwebResponse.message = resErr;
                    res.status(500).send(bitwebResponse.create())
                });
            }).catch((err) => {
                console.error('get sell etcs error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, condition, err);
        
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            });    
        }).catch((err) => {
            console.error('get sell games error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, err);
    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        });
    }).catch((err) => {
        console.error('get buy games error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    });
});

router.get('/banners', async function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {};

    try {
        let bannerList = await serviceBanner.list(country, condition);
        let resData = {
            "bannerList": bannerList
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = bannerList;                
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('get banners error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    } 
});

module.exports = router;