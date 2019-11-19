/**
 * 사용자 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-03
 */
var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let logger = require('../../../utils/log');
let token = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')
let serviceShops = require('../../../service/shops');
let serviceShopBuyers = require('../../../service/shopBuyers');
let serviceUsers = require('../../../service/users');
let serviceCoins = require('../../../service/coins');
let serviceCoinHistorys = require('../../../service/coinHistorys');
let servicePoints = require('../../../service/points');
let servicePointHistorys = require('../../../service/pointHistorys');

//이벤트 상품 목록 API
router.post('/product/list', token.checkInternalToken, async function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = req.body.param;
    // if(req.body.param.country == "KR") {
    //     condition['country'] = {$exists:false};        
    // }    
    let option = req.body.option;

    try {
        let count = await serviceShops.count(country, condition, option);
        let list = await serviceShops.list(country, condition, option);

        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "count": count,
            "list": list
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = resData;

        let jsonResult = bitwebResponse.create();

        jsonResult['pageIdx'] = option.pageIdx;
        jsonResult['perPage'] = option.perPage;

        res.status(200).send(jsonResult);
    } catch(err) {
        console.error('list shop error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

//이벤트 상품 상세조회 API
router.get('/product/:shopId', token.checkInternalToken, async function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let shopId = req.params.shopId;
    let country = dbconfig.country;
    let conditionShop = {
        "_id": shopId
    }
    
    try {
        let shop = await serviceShops.detail(country, conditionShop);
        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "shop": shop
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, shopId, resData);

        bitwebResponse.data = shop;
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('get shop error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, shopId, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

//이벤트 상품 구매 여부 조회 API
router.get('/product/:productType/buyYn/:country/:userTag', token.checkInternalToken, async function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "productType": req.params.productType,
        "country": req.params.country,
        "userTag": req.params.userTag
    };

    try {
        if(req.params.userTag == "undefined") {
            let resData = {
                "successYn": "Y",
                "buyYn": "N"
            } 
            bitwebResponse.code = 200;        
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.params, "no userTag.");
            bitwebResponse.data = resData;
            res.status(200).send(bitwebResponse.create());
            return;
        }

        let shopBuyer = await serviceShopBuyers.detail(country, condition);
        let resData = {
            "successYn": "Y",
            "buyYn": "Y"
        }        
        if(shopBuyer != null) {
            resData["buyYn"] = "N";
        } 

        bitwebResponse.code = 200;        
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.params, resData);

        bitwebResponse.data = resData;
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('buyYn error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.params, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

//이벤트 상품 구매 API
router.post('/product/buy', token.checkInternalToken, async function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let data = req.body;
    data['regDate'] = util.formatDate(new Date().toString());
    // if(req.body.country == "KR") {
    //     delete req.body['country'];
    // }
    
    try {
        let shop = await serviceShops.detail(country, {"_id":data.eventShopId});
        data['productType'] = shop._doc.productType;
        if(shop._doc.eventEnd) {
            let result = {
                "successYn": "N",
                "code":"E001",
                "msg": "해당 상품이 모두 구매 완료 되었습니다. 다음 기회를 이용하세요."
            }
            bitwebResponse.code = 200;
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, result);

            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
            return;
        } else if(shop._doc.leftAmount < data.totalAmount) {
            let result = {
                "successYn": "N",
                "code":"E002",
                "msg": "재고 수량보다 많이 요청했습니다. 재고 수량까지만 구매 가능합니다."
            }
            bitwebResponse.code = 200;
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, result);

            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
            return;
        } else {
            let user = await serviceUsers.detail(country,{"userTag":data.userTag});
            data['countryCode']=user._doc.countryCode;
            data['phone']= (data.phone == undefined ? user._doc.phone : data.phone);
            
            if(data.currencyType != "POINT") {
                let coin = await serviceCoins.detail(country, {"_id":user._doc.coinId});
                // 구매 요청 금액 보다 코인 개수가 적으면 에러 처리
                if(coin._doc['total_' + data.currencyType.toLowerCase()] < data.totalPrice) {
                    let result = {
                        "successYn": "N",
                        "code":"E003",
                        "msg": "보유 코인이 구매할 코인보다 적습니다. 코인 입금 후 다시 요청하세요."
                    }
                    bitwebResponse.code = 200;
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, result);

                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create());
                    return;
                } else {
                    //add coin history
                    let reqCoinHistoryData = {
                        "extType" : "mach",
                        "coinId" : user._doc.coinId,
                        "category" : "withdraw",
                        "status" : "success",
                        "currencyCode" : data.currencyType,
                        "amount" : data.totalPrice,
                        "price" : data.totalPrice,
                        "memo":"이벤트 상품 구매",
                        "regDate" : util.formatDate(new Date().toString())
                    }
                    let addCoinHistory = await serviceCoinHistorys.add(country,reqCoinHistoryData);
                    //update coin
                    let update_total_mach = parseFloat((coin._doc['total_' + data.currencyType.toLowerCase()] - data.totalPrice).toFixed(8));    
                    let updateCoinData = {};
                    updateCoinData['total_' + data.currencyType.toLowerCase()] = update_total_mach;
                    let updatedCoin = await serviceCoins.modify(country, {"_id":user._doc.coinId}, updateCoinData);
                    let leftAmount = shop._doc.leftAmount - data.totalAmount;
                    let updateShopData = {"leftAmount": leftAmount};
                    if(leftAmount <= 0) {
                        updateShopData['eventEnd'] = true;
                    }
                    //update Event shop
                    let updatedShop = await serviceShops.modify(country, {"_id":data.eventShopId}, updateShopData);
                    //구매자 추가
                    let addShopBuyer = await serviceShopBuyers.add(country, data);
                    addShopBuyer._doc['successYn'] = "Y";
                    bitwebResponse.code = 200;
                    let resData = {
                        "successYn": "Y",
                        "addCoinHistory": addCoinHistory,
                        "updatedCoin": updatedCoin,
                        "updatedShop": updatedShop,
                        "addShopBuyer": addShopBuyer
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, data, resData);
    
                    bitwebResponse.data = addShopBuyer;
                    res.status(200).send(bitwebResponse.create())
                }
            } else {
                //포인트
                let point = await servicePoints.detail(country, {"_id":user._doc.pointId});
                // 구매 요청 금액 보다 포인트 개수가 적으면 에러 처리
                if(point._doc.total_point < data.totalPrice) {
                    let result = {
                        "successYn": "N",
                        "code":"E004",
                        "msg": "보유 포인트가 구매할 포인트보다 적습니다. 포인트 입금 후 다시 요청하세요."
                    }
                    bitwebResponse.code = 200;
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, result);

                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create());
                    return;
                } else {
                    //add point history
                    let pointData = {
                        type: "withdraw",
                        extType: "mach",
                        pointId: user._doc.pointId,
                        status: true,
                        amountCurrency: "point",
                        amount: data.totalPrice,
                        point: data.totalPrice,
                        fee: 0,
                        memo:"이벤트 상품 구매",
                        regDate: util.formatDate(new Date().toString())
                    }
                    let addPointHistory = servicePointHistorys.add(country, pointData);

                    //update coin
                    let update_total_point = parseFloat((point._doc.total_point - data.totalPrice).toFixed(8));                    
                    let updatedPoint = await servicePoints.modify(country, {"_id":user._doc.pointId}, {"total_point": update_total_point});
                    let leftAmount = shop._doc.leftAmount - data.totalAmount;
                    let updateShopData = {"leftAmount": leftAmount};
                    if(leftAmount <= 0) {
                        updateShopData['eventEnd'] = true;
                    }
                    //update Event shop
                    let updatedShop = await serviceShops.modify(country, {"_id":data.eventShopId}, updateShopData);
                    //구매자 추가
                    let addShopBuyer = await serviceShopBuyers.add(country, data);
                    addShopBuyer._doc['successYn'] = "Y";
                    bitwebResponse.code = 200;
                    let resData = {
                        "successYn": "Y",
                        "addPointHistory": addPointHistory,
                        "updatedPoint": updatedPoint,
                        "updatedShop": updatedShop,
                        "addShopBuyer": addShopBuyer
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, data, resData);

                    bitwebResponse.data = addShopBuyer;
                    res.status(200).send(bitwebResponse.create())
                }
            }
        }
    } catch(err) {
        console.error('buy shop error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

//사용자 이벤트 상품 구매 조회 API
router.post('/buyer/list', token.checkInternalToken, async function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = req.body.param;
    // if(req.body.param.country == "KR") {
    //     condition['country'] = {$exists:false};        
    // }    
    let option = req.body.option;

    try {
        let count = await serviceShopBuyers.count(country, condition, option);
        let list = await serviceShopBuyers.list(country, condition, option);

        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "count": count,
            "list": list
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = resData;

        let jsonResult = bitwebResponse.create();

        jsonResult['pageIdx'] = option.pageIdx;
        jsonResult['perPage'] = option.perPage;

        res.status(200).send(jsonResult);
    } catch(err) {
        console.error('list shop error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

//이벤트 상품 등록 API
// router.post('/product/add', token.checkInternalToken, async function(req, res, next) {
//     let bitwebResponse = new BitwebResponse();
//     let data = req.body;
//     let country = dbconfig.country;
    
//     try {
//         let addShop = await serviceShops.add(country, data);
//         bitwebResponse.code = 200;
//         let resData = {
//             "successYn": "Y",
//             "addShop": addShop
//         }
//         //API 처리 결과 별도 LOG로 남김
//         logger.addLog(country, req.originalUrl, data, resData);

//         bitwebResponse.data = addShop;
//         res.status(200).send(bitwebResponse.create())
//     } catch(err) {
//         console.error('add shop error =>', err);
//         let resErr = "처리중 에러 발생";
//         //API 처리 결과 별도 LOG로 남김
//         logger.addLog(country, req.originalUrl, data, err.message);

//         bitwebResponse.code = 500;
//         bitwebResponse.message = resErr;
//         res.status(500).send(bitwebResponse.create())
//     }
// });

module.exports = router;