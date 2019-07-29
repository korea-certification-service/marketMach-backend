/**
 * VTR API
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-11
 */
var express = require('express');
var router = express.Router();
//let shortUrl = require('node-url-shortener');
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let serviceItems = require('../../../service/items');
let serviceUsers = require('../../../service/users');
let serviceVtrTemps = require('../../../service/vtrTemps');
let serviceVtrs = require('../../../service/vtrs');
let serviceCoin = require('../../../service/coins');
let serviceCoinHistory = require('../../../service/coinHistorys');
let serviceCancelHistory = require('../../../service/cancelHistorys');
let serviceEscrow = require('../../../service/escrows');
let serviceEscrowHistory = require('../../../service/escrowHistorys');
let smsController = require('../../../service/sms');
let smsContent = require('../../../../../config/smsMessage');
let logger = require('../../../utils/log');
let token = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')

//VTR 거래 API
router.post('/:itemId/step/:stepValue', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let stepValue = req.params.stepValue;

    switch(stepValue) {
        case "0":
            //VTR 거래 요청(방생성)
            _createVTR(req, res, bitwebResponse);
            break;
        case "1":
            //거래 시작
            _startTrade(req, res, bitwebResponse);
            break;
        case "2":
            //구매 확인
            _reqBuy(req, res, bitwebResponse);
            break;
        case "3":
            //판매 완료
            _reqSell(req, res, bitwebResponse);
            break;
        case "4":
            //거래 완료
            _reqComplete(req, res, bitwebResponse);
            break;
        case "5":
            //거래 취소
            _reqCancel(req, res, bitwebResponse);
            break;
        case "10" :
            //바로 구매
            _buynow(req, res, bitwebResponse);
            break;
        case "15" :
            //바로 구매 취소
            _reqCancelBuyNow(req, res, bitwebResponse);
            break;
        default:
            bitwebResponse.code = 500;
            bitwebResponse.message = "요청을 처리할 수 없습니다.";
            res.status(500).send(bitwebResponse.create())
            break;
    }
});

function _createVTR(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let body = req.body;
    let country = dbconfig.country;
    let conditionUser = {
        "userTag": {$in:[body.sellerTag, body.buyerTag]}
    }
    let conditionItem = {
        "_id": itemId
    }
    
    //사용자 조회
    serviceUsers.list(country, conditionUser)
    .then((users) => {
        // 전화번호가 존재하지 않을 경우 에러 메시지 표시
        for (var i in users) {
            if (users[i]._doc.phone == undefined || users[i]._doc.phone == "") {
                let errMsg = "There is no phone."
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, errMsg);
                            
                bitwebResponse.code = 403;
                bitwebResponse.data = errMsg;
                res.status(403).send(bitwebResponse.create());
                return;
            }
        }
        let userInfo = serviceItems.setUserInfoForVtr(users, body);
        
        //item 정보 조회
        serviceItems.detail(country, conditionItem)
        .then((item) => {      
            let roomToken =body.buyerTag+"|"+ body.sellerTag+"|"+itemId;  
            let reqData = {
                "roomToken":roomToken,
                "buyer_id": body.buyerTag,
                "seller_id": body.sellerTag,
                "cmod": "deal",                
                "item": item,
                "regDate": util.formatDate(new Date().toString())
            }
            if(body.country != undefined) {
                if(body.country != "KR") {
                    reqData["country"] = body.country;
                }
            }
            console.log('req VtrTemp data =>', reqData);
            
            //vtr 방 생성
            serviceVtrTemps.add(country, reqData)
            .then((addVtrTemp) => {
                let updateData = {
                    "roomToken": roomToken,
                    "status": 50,
                    "vtrTempId": addVtrTemp._doc._id,
                };
                if(item._doc.catrgory == "game") {
                    updateData['target_game_character'] = body.target_game_character;
                }
                console.log('update item data =>', updateData);
    
                //vtr 방 넘버,상태, roomToken값 update
                serviceItems.modify(country, conditionItem, updateData)
                .then((updateItem) => {
                    console.log("HOST : ", req.headers.origin);
                    
                    //SMS전송
                    let phone = userInfo.seller_phone;
                    let whoReqUser = body.buyerTag;
                    let smsMessage = smsContent.sms.ko;
                    let url = req.headers.origin + '/sms/room?roomToken='+updateItem._doc.roomToken+'&itemId=' + updateItem._doc._id + '&user_id=' + updateItem._doc.userTag + '&vtrTempId=' + addVtrTemp._doc._id;
                    if(updateItem._doc.trade_type == "buy") {
                        whoReqUser = sellerTag;
                        phone = userInfo.buyer_phone;
                    } 
                    
                    if(req.headers.origin == undefined) {
                        let message = whoReqUser + smsMessage + itemId;
                        console.log("Send SMS Message => ", message);
                        smsController.sendSms(phone, message, 'no')
                        .then(sms => {
                            bitwebResponse.code = 200;
                            updateItem._doc['successYn'] = "Y";
                            let resData = {
                                "item": updateItem, 
                                "vtrTemp": addVtrTemp,
                                "sms": sms
                            }
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, resData);
                            updateItem._doc['successYn'] = "Y";
                            bitwebResponse.data = updateItem
                            res.status(200).send(bitwebResponse.create())
                        }).catch((err) => {
                            console.error('send sms error =>', err)
                            updateItem._doc['successYn'] = "Y";
                            let resData = {
                                "item": updateItem, 
                                "vtrTemp": addVtrTemp,
                                "sms": err
                            }
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, resData);
                            updateItem._doc['successYn'] = "Y";
                            bitwebResponse.data = updateItem
                            res.status(200).send(bitwebResponse.create())
                        });
                    } else if(req.headers.origin.indexOf("marketmach") > 0) {
                        shortUrl.short(encodeURIComponent(url), function (err, resultUrl) {
                            let message = whoReqUser + smsMessage + resultUrl;
                            console.log("Send SMS Message => ", message);
                            smsController.sendSms(phone, message)
                            .then(sms => {
                                bitwebResponse.code = 200;
                                updateItem._doc['successYn'] = "Y";
                                let resData = {
                                    "item": updateItem, 
                                    "vtrTemp": addVtrTemp,
                                    "sms": sms
                                }
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, resData);
                                updateItem._doc['successYn'] = "Y";
                                bitwebResponse.data = updateItem
                                res.status(200).send(bitwebResponse.create())
                            }).catch((err) => {
                                console.error('send sms error =>', err)
                                updateItem._doc['successYn'] = "Y";
                                let resData = {
                                    "item": updateItem, 
                                    "vtrTemp": addVtrTemp,
                                    "sms": err
                                }
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, resData);
                                updateItem._doc['successYn'] = "Y";
                                bitwebResponse.data = updateItem
                                res.status(200).send(bitwebResponse.create())
                            });
                        });              
                    } else {
                        bitwebResponse.code = 200;
                        updateItem._doc['successYn'] = "Y";
                        let resData = {
                            "item": updateItem, 
                            "vtrTemp": addVtrTemp,
                            "sms": "no"
                        }
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, resData);
                        updateItem._doc['successYn'] = "Y";
                        bitwebResponse.data = updateItem
                        res.status(200).send(bitwebResponse.create())
                    }
                }).catch((err) => {
                    console.error('update item error =>', err);
                    let resErr = "처리중 에러 발생";
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, err);
                            
                    bitwebResponse.code = 500;
                    bitwebResponse.message = resErr;
                    res.status(500).send(bitwebResponse.create())
                })
            }).catch((err) => {
                console.error('add vtrTemp error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);
                            
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('add vtrTemp error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
                        
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
}

function _startTrade(req, res, bitwebResponse) {
    let country = dbconfig.country;
    let itemId = req.params.itemId;
    let body = req.body;

    let conditionUser = {
        "userTag": {$in:[body.sellerTag, body.buyerTag]}
    }
    
    serviceUsers.list(country, conditionUser)
    .then((users) => {
        serviceVtrs.detail(country, {"item._id": itemId})
        .then((vtr) => {            
            if(vtr == null) {
                //item 정보 조회
                let conditionItem = {
                    "_id": itemId
                }
                serviceItems.detail(country, conditionItem)
                .then((item) => {    
                    //vtr 정보를 추가한다.
                    //아이템 상태 정보 update, 거래 요청 시 요청 가격이 틀리면 가격도 update한다.        
                    let userInfo = serviceItems.setUserInfoForVtr(users, body);
                    let reqVtr = Object.assign({}, body, userInfo);
                    item._doc.status = 1;
                    if(body.price != undefined) {
                        item._doc.price = body.price;
                        item._doc.total_price = body.price;
                    }
                    reqVtr['item'] = item;
                    reqVtr['regDate'] = util.formatDate(new Date().toString())
                    if(item._doc.category == "game") {
                        if (item._doc.trade_type == "buy") {
                            reqVtr['buyer_game_character'] = item._doc.game_character;
                            reqVtr['seller_game_character'] = item._doc.target_game_character;
                        } else {
                            reqVtr['buyer_game_character'] = item._doc.target_game_character;
                            reqVtr['seller_game_character'] = item._doc.game_character;
                        }
                    }    
                    serviceVtrs.add(country, reqVtr)
                    .then(addVtr => {
                        // vtr['country'] = country;
                        // vtr['makeFrom'] = "vtr";
                        let modifyItemData = {
                            'status': 1,
                            'cryptoCurrencyCode': body.cryptoCurrencyCode,
                            'price': body.price,
                            'total_price': body.price,
                            'vtr': reqVtr
                        };

                        console.log('modify item data =>', modifyItemData);
                        
                        serviceItems.modify(country, conditionItem, modifyItemData)
                        .then((updateItem) => {
                            updateItem._doc['successYn'] = "Y";
                            let resData = {
                                "vtr": addVtr,
                                "item": updateItem
                            }
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, resData);
                            
                            bitwebResponse.code = 200;
                            bitwebResponse.data = Object.assign({}, updateItem);
                            res.status(200).send(bitwebResponse.create())
                        }).catch((err) => {
                            console.error('add vtr error =>', err);
                            let resErr = "처리중 에러 발생";
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, err);
                            
                            bitwebResponse.code = 500;
                            bitwebResponse.message = resErr;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                        console.error('add vtr error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
                        
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })
                })    
            } else {
                //vtr이 존재하는 경우 거래 진행 중으로 응답
                let msg = {
                    "successYn": "N",
                    "code" : "E001",
                    "msg" : "해당 아이템은 거래 진행 중입니다. 거래를 진행할 수 없습니다."
                };
                bitwebResponse.code = 200;
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, msg);
                    
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create())
            }
        }).catch((err) => {
            console.error('get vtr error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
                    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })  
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
                    
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
}

function _reqBuy(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let conditionItem = {
        "_id": itemId
    }
    
    serviceVtrs.detail(country, {"item._id": itemId})
    .then((vtr) => {    
        //아이템 status 값이 2 이상인 경우면 실패로 처리
        if(vtr._doc.item.status >= 2) {
            let msg = {
                "successYn": "N",
                "code" : "E002",
                "msg" : "해당 아이템은 거래 진행 중입니다. 해당 거래에 에스크로를 할 수 없습니다."
            };
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, msg);

            bitwebResponse.code = 200;
            bitwebResponse.data = msg;
            res.status(200).send(bitwebResponse.create());
            return;
        }
        
        let conditionUser = {
            "_id":vtr._doc.to_userId
        }

        serviceUsers.detail(country, conditionUser)
        .then((user) => {
            let conditionCoin = {
                "_id": user._doc.coinId
            }
    
            serviceCoin.detail(country, conditionCoin)
            .then((coin) => {
                //To-Do : 비트코인, 이더리움도 에스크로 가능 하도록 개선
                let user_price = coin.total_mach;
                if(vtr._doc.cryptoCurrencyCode == "BTC") {
                    user_price = coin.total_btc == undefined ? 0 : coin.total_btc;
                } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                    user_price = coin.total_ether == undefined ? 0 : coin.total_ether;
                }
                if (user_price < 0 || user_price < vtr._doc.price) {
                    let msg = {
                        "successYn": "N",
                        "code" : "E001",
                        "msg" : "거래금액이 구매자의 보유 금액보다 클 수 없습니다."
                    };
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, msg);
    
                    bitwebResponse.code = 200;
                    bitwebResponse.data = msg;
                    res.status(200).send(bitwebResponse.create());
                    return;
                } 

                //아이템 상태 정보 update, 거래 요청 시 요청 가격이 틀리면 가격도 update한다.    
                let reqVtr = {
                    "buy_status" : true,
                    "completed_buy_date" : util.formatDate(new Date().toString()),
                    "item.status": 2
                };
                serviceVtrs.modify(country, {"item._id": itemId}, reqVtr)
                .then(modifyVtr => {
                    let reqData = {
                        'status': 2,
                        'vtr': modifyVtr
                    };

                    serviceItems.modify(country, conditionItem, reqData)
                    .then((updateItem) => {              
                        //구매자 coin 차감 및 에스크로
                        let result_price = parseFloat((user_price - vtr._doc.price).toFixed(8));
                        let reqDataCoin = {"total_mach": result_price};
                        if(vtr._doc.cryptoCurrencyCode == "BTC") {
                            reqDataCoin = {"total_btc": result_price};
                        } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                            reqDataCoin = {"total_ether": result_price};
                        }   
                        
                        serviceCoin.modify(country, conditionCoin, reqDataCoin)
                        .then(updateCoin => {
                            let reqDataEscrow = {
                                'vtrId': vtr._doc._id,
                                'itemId': updateItem._doc._id,
                                'cryptoCurrencyCode': vtr._doc.cryptoCurrencyCode,    
                                'price': vtr._doc.price,
                                'sellerUser': vtr._doc.from_userId,
                                'buyerUser': vtr._doc.to_userId,
                                'status':'processing',
                                'regDate': util.formatDate(new Date().toString())
                            }
                            console.log('req escrow data =>', reqDataEscrow);
                            serviceEscrow.add(country,reqDataEscrow)
                            .then((addEscrow)=> {
                                let reqDataEscrowHistory = {
                                    "type": "deposit",
                                    "itemId": updateItem._doc._id,
                                    "vtr": vtr,
                                    "cryptoCurrencyCode": vtr._doc.cryptoCurrencyCode,                                                                                           
                                    "price": vtr._doc.price,
                                    "reqUser":vtr._doc.to_userId,
                                    "regDate": util.formatDate(new Date().toString())
                                };
                                reqDataEscrowHistory['escrowId'] = addEscrow._doc._id;
                                console.log('req escrow history data =>', reqDataEscrow);
                                serviceEscrowHistory.add(country, reqDataEscrowHistory);
                                
                                let reqCoinHistoryData = {
                                    "extType" : "mach",
                                    "coinId" : user._doc.coinId,
                                    "category" : "withdraw",
                                    "status" : "success",
                                    "currencyCode" : vtr._doc.cryptoCurrencyCode,
                                    "amount" : vtr._doc.price,
                                    "price" : vtr._doc.price,
                                    "regDate" : util.formatDate(new Date().toString())
                                }
                                serviceCoinHistory.add(country,reqCoinHistoryData);
    
                                updateItem._doc['successYn'] = "Y";
                                let resData = {
                                    "vtr": modifyVtr,
                                    "item": updateItem,
                                    "coin": updateCoin,
                                    "escrow": addEscrow,
                                    "escrowHistory": reqDataEscrow,
                                    "coinHistory": reqCoinHistoryData
                                }
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, resData);
    
                                bitwebResponse.code = 200;
                                bitwebResponse.data = Object.assign({}, updateItem);
                                res.status(200).send(bitwebResponse.create())
                            }).catch((err) => {
                                console.error('add escrow error =>', err);
                                let resErr = "처리중 에러 발생";
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, err);             
    
                                bitwebResponse.code = 500;
                                bitwebResponse.message = resErr;
                                res.status(500).send(bitwebResponse.create())
                            })
                        }).catch((err) => {
                            console.error('update coin error =>', err);
                            let resErr = "처리중 에러 발생";
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, err);
    
                            bitwebResponse.code = 500;
                            bitwebResponse.message = resErr;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                        console.error('add vtr error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
    
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })
                });  
            }).catch((err) => {
                console.error('get coin error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);
    
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        })
    }).catch((err) => {
        console.error('get vtr error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })  
}

function _reqSell(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let conditionItem = {
        "_id": itemId
    }
    
    serviceVtrs.detail(country, {"item._id": itemId})
    .then((vtr) => {    
        //아이템 status 값이 1이거나 4 이상인 경우면 실패로 처리
        if(vtr._doc.item.status == 1 || vtr._doc.item.status >= 4) {
            let msg = {
                "successYn": "N",
                "code" : "E001",
                "msg" : "해당 아이템의 구매 확인을 진행 중이거나 거래가 완료되었습니다."
            };
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, msg);

            bitwebResponse.code = 200;
            bitwebResponse.data = msg;
            res.status(200).send(bitwebResponse.create());
            return;
        }

        let currentDate = new Date().toString();
        let auto_completed_confirm_date = util.calculateDate(currentDate, "D", 7);
        if(vtr._doc.item.category == "game") {
            auto_completed_confirm_date = util.calculateDate(currentDate, "D", 1);
        } 
        //판매완료 시 상태값을 update한다.
        let reqVtr = {
            "sell_status" : true,
            "completed_sell_date" : util.formatDate(new Date().toString()),
            "auto_completed_confirm_date": auto_completed_confirm_date,
            "item.status": 3
        };
        serviceVtrs.modify(country, {"item._id": itemId}, reqVtr)
        .then(modifyVtr => {
            let reqData = {
                'status': 3,
                'vtr': modifyVtr
            };

            serviceItems.modify(country, conditionItem, reqData)
            .then((updateItem) => {             
                updateItem._doc['successYn'] = "Y"; 
                let resData = {
                    "vtr": modifyVtr,
                    "item": updateItem
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, resData);

                bitwebResponse.code = 200;
                bitwebResponse.data = Object.assign({}, updateItem);
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
                console.error('add vtr error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);

                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('add vtr error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);

            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        }) 
    }).catch((err) => {
        console.error('add vtr error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
}

function _reqComplete(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let conditionItem = {
        "_id": itemId
    }
    
    serviceVtrs.detail(country, {"item._id": itemId})
    .then((vtr) => {            
    //아이템 status 값이 2 이하거나 5 이상인 경우면 실패로 처리
    if(vtr._doc.item.status <= 2 || vtr._doc.item.status > 4) {
        let msg = {
            "successYn": "N",
            "code" : "E001",
            "msg" : "해당 아이템의 구매 확인을 진행 중이거나 거래가 완료되었습니다."
        };
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, msg);

        bitwebResponse.code = 200;
        bitwebResponse.data = msg;
        res.status(200).send(bitwebResponse.create());
        return;
    }

        let conditionUser = {
            "_id":vtr._doc.from_userId
        }

        serviceUsers.detail(country, conditionUser)
        .then((user) => {
            let conditionCoin = {
                "_id": user._doc.coinId
            }
    
            serviceCoin.detail(country, conditionCoin)
            .then((coin) => {
                //To-Do : 비트코인, 이더리움도 에스크로 가능 하도록 개선
                let user_price = coin.total_mach;
                if(vtr._doc.cryptoCurrencyCode == "BTC") {
                    user_price = coin.total_btc == undefined ? 0 : coin.total_btc;
                } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                    user_price = coin.total_ether == undefined ? 0 : coin.total_ether;
                }

                //아이템 상태 정보 update.    
                let reqVtr = {
                    "confirm_status": true,
                    "completed" : true,
                    "completed_confirm_date": util.formatDate(new Date().toString()),
                    "completed_date" : util.formatDate(new Date().toString()),
                    "item.status": 4
                };
                serviceVtrs.modify(country, {"item._id": itemId}, reqVtr)
                .then(modifyVtr => {
                    let reqData = {
                        'status': 4,
                        'vtr': modifyVtr
                    };

                    serviceItems.modify(country, conditionItem, reqData)
                    .then((updateItem) => {              
                        //판매자 에스크로 금액 입금
                        let result_price = parseFloat((user_price + vtr._doc.price).toFixed(8));
                        let reqDataCoin = {"total_mach": result_price};
                        if(vtr._doc.cryptoCurrencyCode == "BTC") {
                            reqDataCoin = {"total_btc": result_price};
                        } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                            reqDataCoin = {"total_ether": result_price};
                        }   
                        
                        serviceCoin.modify(country, conditionCoin, reqDataCoin)
                        .then(updateCoin => {
                            let reqDataEscrow = {
                                'status':'completed',
                                'completed_regDate': util.formatDate(new Date().toString())
                            }
                            console.log('req escrow data =>', reqDataEscrow);
                            serviceEscrow.modify(country,{'vtrId':modifyVtr._doc._id},reqDataEscrow)
                            .then((modifyEscrow)=> {
                                let reqDataEscrowHistory = {
                                    "type": "withdraw",
                                    "itemId": updateItem._doc._id,
                                    "vtr": vtr,
                                    "cryptoCurrencyCode": vtr._doc.cryptoCurrencyCode,                                                                                           
                                    "price": vtr._doc.price,
                                    "reqUser":vtr._doc.from_userId,
                                    "regDate": util.formatDate(new Date().toString())
                                };
                                reqDataEscrowHistory['escrowId'] = modifyEscrow._doc._id;
                                console.log('req escrow history data =>', reqDataEscrow);
                                serviceEscrowHistory.add(country, reqDataEscrowHistory);
                                
                                let reqCoinHistoryData = {
                                    "extType" : "mach",
                                    "coinId" : user._doc.coinId,
                                    "category" : "deposit",
                                    "status" : "success",
                                    "currencyCode" : vtr._doc.cryptoCurrencyCode,
                                    "amount" : vtr._doc.price,
                                    "price" : vtr._doc.price,
                                    "regDate" : util.formatDate(new Date().toString())
                                }
                                serviceCoinHistory.add(country,reqCoinHistoryData);
    
                                updateItem._doc['successYn'] = "Y";
                                let resData = {
                                    "vtr": modifyVtr,
                                    "item": updateItem,
                                    "coin": updateCoin,
                                    "escrow": modifyEscrow,
                                    "escrowHistory": reqDataEscrow,
                                    "coinHistory": reqCoinHistoryData
                                }
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, resData);
    
                                bitwebResponse.code = 200;
                                bitwebResponse.data = Object.assign({}, updateItem);
                                res.status(200).send(bitwebResponse.create())
                            }).catch((err) => {
                                console.error('add escrow error =>', err);
                                let resErr = "처리중 에러 발생";
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, err);
    
                                bitwebResponse.code = 500;
                                bitwebResponse.message = resErr;
                                res.status(500).send(bitwebResponse.create())
                            })
                        }).catch((err) => {
                            console.error('update coin error =>', err);
                            let resErr = "처리중 에러 발생";
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, err);
    
                            bitwebResponse.code = 500;
                            bitwebResponse.message = resErr;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                        console.error('add vtr error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
    
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })
                });  
            }).catch((err) => {
                console.error('get coin error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);
    
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        })
    }).catch((err) => {
        console.error('get vtr error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })  
}

function _reqCancel(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let reqUserTag = req.body.reqUserTag;
    let conditionItem = {
        "_id": itemId
    }

    serviceUsers.detail(country, {"userTag":reqUserTag}) 
    .then(user => {
        serviceVtrs.detail(country, {"item._id":itemId})
        .then(vtr => {
            if(vtr._doc.buy_status != undefined && user._doc._id.toString() == vtr._doc.to_userId.toString()) {
                let msg = {};
                // if(vtr._doc.sell_status == undefined) {
                //     msg = {
                //         "successYn":"N",
                //         "code": 32,
                //         "msg": '현재 상태에서는 거래취소가 불가능합니다. 판매자님에게 환불을 요청하세요.'
                //     }
                // } else {
                //     if(vtr._doc.completed == undefined) {
                //         msg = {
                //             "successYn":"N",
                //             "code": 42,
                //             "msg": '현재 상태에서는 거래취소가 불가능합니다. 판매자님에게 환불을 요청하거나 사이트에서 이의신청 해주세요.'
                //         }
                //     } else {
                //         msg = {
                //             "successYn":"N",
                //             "code": 52,
                //             "msg": '거래가 완료되어 거래취소하실 수 없습니다.'
                //         }
                //     }
                // }
                if(vtr._doc.completed == undefined) {
                    msg = {
                        "successYn":"N",
                        "code": 42,
                        "msg": '현재 상태에서는 거래취소가 불가능합니다. 판매자님에게 환불을 요청하거나 사이트에서 이의신청 해주세요.'
                    }
                } else {
                    msg = {
                        "successYn":"N",
                        "code": 52,
                        "msg": '거래가 완료되어 거래취소하실 수 없습니다.'
                    }
                }

                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, msg);
    
                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create());
                return;
            }

            if(vtr._doc.completed != undefined) {
                //거래 완료된 경우 취소 요청 불가
                let msg = {
                    "successYn":"N",
                    "code": 52,
                    "msg": '거래가 완료되어 거래취소하실 수 없습니다.'
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, msg);
    
                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create());
                return;
            }


            //단순 거래 취소
            let reqItem = {
                "status": 50
            };

            serviceItems.modify(country, conditionItem, reqItem)
            .then(updatedItem => {
                if(vtr._doc.buy_status == undefined) {
                    serviceVtrs.remove(country, {"_id":vtr._doc._id})
                    .then(deletedVtr => {
                        let msg = {
                            "successYn":"Y",
                            "code": 31,
                            "msg": '구매자님이 거래를 취소 하였습니다.'
                        }

                        if(user._doc._id.toString() != vtr._doc.to_userId.toString()) {
                            msg = {
                                "successYn":"Y",
                                "code": 41,
                                "msg": '판매자님이 거래를 취소 하였습니다.'
                            }
                        }

                        let resData = {
                            "result":msg,
                            "vtr": deletedVtr,
                            "item": updatedItem
                        }
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, resData);

                        bitwebResponse.code = 200;
                        bitwebResponse.data = msg;
                        res.status(200).send(bitwebResponse.create())
                    }).catch((err) => {
                        console.error('delete vtr error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
                
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })  
                } else {
                    //환불 및 거래 취소
                    serviceUsers.detail(country, {"_id":vtr._doc.to_userId}) 
                    .then(to_user => {
                        serviceCoin.detail(country, {"_id":to_user._doc.coinId})
                        .then((coin) => {                            
                            let user_price = coin.total_mach;
                            if(vtr._doc.cryptoCurrencyCode == "BTC") {
                                user_price = coin.total_btc == undefined ? 0 : coin.total_btc;
                            } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                                user_price = coin.total_ether == undefined ? 0 : coin.total_ether;
                            }

                            let reqData = {
                                'status': 50,
                                'vtr': ''
                            };

                            serviceItems.modify(country, conditionItem, reqData)
                            .then((updateItem) => {              
                                //판매자 에스크로 금액 입금
                                let result_price = parseFloat((user_price + vtr._doc.price).toFixed(8));
                                let reqDataCoin = {"total_mach": result_price};
                                if(vtr._doc.cryptoCurrencyCode == "BTC") {
                                    reqDataCoin = {"total_btc": result_price};
                                } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                                    reqDataCoin = {"total_ether": result_price};
                                }   
                                
                                serviceCoin.modify(country, {"_id":to_user._doc.coinId}, reqDataCoin)
                                .then(updateCoin => {
                                    let reqDataEscrow = {
                                        'status':'cancelled',
                                        'cancelled_regDate': util.formatDate(new Date().toString())
                                    }
                                    console.log('req escrow data =>', reqDataEscrow);
                                    serviceEscrow.modify(country,{'vtrId':vtr._doc._id},reqDataEscrow)
                                    .then((modifyEscrow)=> {
                                        let reqDataEscrowHistory = {
                                            "type": "cancel",
                                            "itemId": itemId,
                                            "vtr": vtr,
                                            "cryptoCurrencyCode": vtr._doc.cryptoCurrencyCode,                                                                                           
                                            "price": vtr._doc.price,
                                            "reqUser": to_user._doc._id,
                                            "regDate": util.formatDate(new Date().toString())
                                        };
                                        reqDataEscrowHistory['escrowId'] = modifyEscrow._doc._id;
                                        console.log('req escrow history data =>', reqDataEscrow);
                                        serviceEscrowHistory.add(country, reqDataEscrowHistory);
                                        
                                        let reqCoinHistoryData = {
                                            "extType" : "mach",
                                            "coinId" : to_user._doc.coinId,
                                            "category" : "deposit",
                                            "status" : "success",
                                            "currencyCode" : vtr._doc.cryptoCurrencyCode,
                                            "amount" : vtr._doc.price,
                                            "price" : vtr._doc.price,
                                            "regDate" : util.formatDate(new Date().toString())
                                        }
                                        serviceCoinHistory.add(country,reqCoinHistoryData);

                                        let reqCancelHistory = {
                                            "vtr": vtr,
                                            "item": vtr._doc.item,
                                            "from_userId": vtr._doc.from_userId,
                                            "to_userId": vtr._doc.to_userId,
                                            "status": "user_cancel",
                                            "refund": vtr._doc.buy_status == undefined ? false : true,
                                            "regDate": util.formatDate(new Date().toString())
                                        };
                                        serviceCancelHistory.add(country, reqCancelHistory)
                                        .then(() => {
                                            serviceVtrs.remove(country, {"_id":vtr._doc._id})
                                            .then(deletedVtr => {
                                                let msg = {
                                                    "successYn":"Y",
                                                    "code": 31,
                                                    "msg": '구매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.'
                                                }
                        
                                                if(user._doc._id.toString() != vtr._doc.to_userId.toString()) {
                                                    msg = {
                                                        "successYn":"Y",
                                                        "code": 41,
                                                        "msg": '판매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.'
                                                    }
                                                }
                                                
                                                let resData = {
                                                    "result":msg,
                                                    "vtr": deletedVtr,
                                                    "item": updateItem,
                                                    "coin": updateCoin,
                                                    "escrow": modifyEscrow,
                                                    "escrowHistory": reqDataEscrow,
                                                    "coinHistory": reqCoinHistoryData
                                                }
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, resData);
                    
                                                bitwebResponse.code = 200;
                                                bitwebResponse.data = msg;
                                                res.status(200).send(bitwebResponse.create())
                                            }).catch((err) => {
                                                console.error('delete vtr error =>', err);
                                                let resErr = "처리중 에러 발생";
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, err);
                                        
                                                bitwebResponse.code = 500;
                                                bitwebResponse.message = resErr;
                                                res.status(500).send(bitwebResponse.create())
                                            })  
                                        })
                                    }).catch((err) => {
                                        console.error('add escrow error =>', err);
                                        let resErr = "처리중 에러 발생";
                                        //API 처리 결과 별도 LOG로 남김
                                        logger.addLog(country, req.originalUrl, req.body, err);
            
                                        bitwebResponse.code = 500;
                                        bitwebResponse.message = resErr;
                                        res.status(500).send(bitwebResponse.create())
                                    })
                                }).catch((err) => {
                                    console.error('update coin error =>', err);
                                    let resErr = "처리중 에러 발생";
                                    //API 처리 결과 별도 LOG로 남김
                                    logger.addLog(country, req.originalUrl, req.body, err);
            
                                    bitwebResponse.code = 500;
                                    bitwebResponse.message = resErr;
                                    res.status(500).send(bitwebResponse.create())
                                })
                            }).catch((err) => {
                                console.error('add vtr error =>', err);
                                let resErr = "처리중 에러 발생";
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, err);
            
                                bitwebResponse.code = 500;
                                bitwebResponse.message = resErr;
                                res.status(500).send(bitwebResponse.create())
                            })
                        }).catch((err) => {
                            console.error('get coin error =>', err);
                            let resErr = "처리중 에러 발생";
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, err);
                
                            bitwebResponse.code = 500;
                            bitwebResponse.message = resErr;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                        console.error('get user error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
                
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })  
                }
            }).catch((err) => {
                console.error('modify item error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);
        
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })  
        }).catch((err) => {
            console.error('get vtr error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);

            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })  
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
}

function _buynow(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let body = req.body;
    let country = dbconfig.country;
    let conditionUser = {
        "userTag": {$in:[body.sellerTag, body.buyerTag]}
    }
    let conditionItem = {
        "_id": itemId
    }

    //사용자 조회
    serviceUsers.list(country, conditionUser)
    .then((users) => {
        // 전화번호가 존재하지 않을 경우 에러 메시지 표시
        for (var i in users) {
            if (users[i]._doc.phone == undefined || users[i]._doc.phone == "") {
                let errMsg = "There is no phone."
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, errMsg);
                            
                bitwebResponse.code = 403;
                bitwebResponse.data = errMsg;
                res.status(403).send(bitwebResponse.create());
                return;
            }
        }
        let userInfo = serviceItems.setUserInfoForVtr(users, body);
        
        //item 정보 조회
        serviceItems.detail(country, conditionItem)
        .then((item) => {      
            let roomToken =body.buyerTag+"|"+ body.sellerTag+"|"+itemId;  
            item._doc.status = 2;
            if(item._doc.category == "game") {
                item._doc['target_game_character'] = body.target_game_character;
            }   
            let reqData = {
                "roomToken":roomToken,
                "buyer_id": body.buyerTag,
                "seller_id": body.sellerTag,
                "cmod": "deal",
                "country":country,
                "item": item,
                "regDate": util.formatDate(new Date().toString())
            }
            console.log('req VtrTemp data =>', reqData);
            
            //구매자 coin 조회
            serviceUsers.detail(country, {"_id":userInfo.to_userId})
            .then((to_user) => {
                let conditionCoin = {
                    "_id": to_user._doc.coinId
                }
        
                serviceCoin.detail(country, conditionCoin)
                .then((coin) => {
                    //비트코인, 이더리움도 에스크로 가능 하도록 계산
                    let user_price = coin.total_mach;
                    if(body.cryptoCurrencyCode == "BTC") {
                        user_price = coin.total_btc == undefined ? 0 : coin.total_btc;
                    } else if(body.cryptoCurrencyCode == "ETH") {
                        user_price = coin.total_ether == undefined ? 0 : coin.total_ether;
                    }
                    if (user_price < 0 || user_price < body.price) {
                        let msg = {
                            "successYn": "N",
                            "code" : "E001",
                            "msg" : "거래금액이 구매자의 보유 금액보다 클 수 없습니다."
                        };
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, msg);
        
                        bitwebResponse.code = 200;
                        bitwebResponse.data = msg;
                        res.status(200).send(bitwebResponse.create());
                        return;
                    } 

                    //1. vtr 방 생성
                    serviceVtrTemps.add(country, reqData)
                    .then((addVtrTemp) => {
                        //vtr 정보를 추가한다.
                        //아이템 상태 정보 update, 거래 요청 시 요청 가격이 틀리면 가격도 update한다.        
                        let reqVtr = Object.assign({}, body, userInfo);
                        reqVtr['vtrTempId'] = addVtrTemp._doc._id;
                        reqVtr['item'] = item;
                        reqVtr['regDate'] = util.formatDate(new Date().toString())
                        reqVtr["buy_status"] = true;
                        reqVtr["completed_buy_date"] = util.formatDate(new Date().toString());
                        if(item._doc.category == "game") {
                            if (item._doc.trade_type == "buy") {
                                reqVtr['buyer_game_character'] = item._doc.game_character;
                                reqVtr['seller_game_character'] = item._doc.target_game_character;
                            } else {
                                reqVtr['buyer_game_character'] = item._doc.target_game_character;
                                reqVtr['seller_game_character'] = item._doc.game_character;
                            }
                        }    
                        //2. VTR 거래 요청
                        serviceVtrs.add(country, reqVtr)
                        .then(addVtr => {
                            let modifyItemData = {
                                'status': 2,
                                'vtr': reqVtr
                            };

                            console.log('modify item data =>', modifyItemData);
                            // 3. item 상태 수정
                            serviceItems.modify(country, conditionItem, modifyItemData)
                            .then((updateItem) => {
                                console.log("HOST : ", req.headers.origin);
                                
                                //4. 구매자 coin 차감 및 에스크로
                                let result_price = parseFloat((user_price - addVtr._doc.price).toFixed(8));
                                let reqDataCoin = {"total_mach": result_price};
                                if(addVtr._doc.cryptoCurrencyCode == "BTC") {
                                    reqDataCoin = {"total_btc": result_price};
                                } else if(addVtr._doc.cryptoCurrencyCode == "ETH") {
                                    reqDataCoin = {"total_ether": result_price};
                                }   
                                
                                serviceCoin.modify(country, conditionCoin, reqDataCoin)
                                .then(updateCoin => {
                                    let reqDataEscrow = {
                                        'vtrId': addVtr._doc._id,
                                        'itemId': updateItem._doc._id,
                                        'cryptoCurrencyCode': addVtr._doc.cryptoCurrencyCode,    
                                        'price': addVtr._doc.price,
                                        'sellerUser': addVtr._doc.from_userId,
                                        'buyerUser': addVtr._doc.to_userId,
                                        'status':'processing',
                                        'regDate': util.formatDate(new Date().toString())
                                    }
                                    console.log('req escrow data =>', reqDataEscrow);
                                    serviceEscrow.add(country,reqDataEscrow)
                                    .then((addEscrow)=> {
                                        let reqDataEscrowHistory = {
                                            "type": "deposit",
                                            "itemId": updateItem._doc._id,
                                            "vtr": addVtr,
                                            "cryptoCurrencyCode": addVtr._doc.cryptoCurrencyCode,                                                                                           
                                            "price": addVtr._doc.price,
                                            "reqUser":addVtr._doc.to_userId,
                                            "regDate": util.formatDate(new Date().toString())
                                        };
                                        reqDataEscrowHistory['escrowId'] = addEscrow._doc._id;
                                        console.log('req escrow history data =>', reqDataEscrow);
                                        serviceEscrowHistory.add(country, reqDataEscrowHistory);
                                        
                                        let reqCoinHistoryData = {
                                            "extType" : "mach",
                                            "coinId" : to_user._doc.coinId,
                                            "category" : "withdraw",
                                            "status" : "success",
                                            "currencyCode" : addVtr._doc.cryptoCurrencyCode,
                                            "amount" : addVtr._doc.price,
                                            "price" : addVtr._doc.price,
                                            "regDate" : util.formatDate(new Date().toString())
                                        }
                                        serviceCoinHistory.add(country,reqCoinHistoryData);
            
                                        //5.SMS전송
                                        let phone = userInfo.seller_phone;
                                        let whoReqUser = body.buyerTag;
                                        let smsMessage = smsContent.sms.ko;
                                        let url = req.headers.origin + '/sms/room?roomToken='+updateItem._doc.roomToken+'&itemId=' + updateItem._doc._id + '&user_id=' + updateItem._doc.userTag + '&vtrTempId=' + addVtrTemp._doc._id;
                                        if(updateItem._doc.trade_type == "buy") {
                                            whoReqUser = sellerTag;
                                            phone = userInfo.buyer_phone;
                                        } 

                                        if(req.headers.origin == undefined) {
                                            let message = whoReqUser + smsMessage + itemId;
                                            console.log("Send SMS Message => ", message);
                                            smsController.sendSms(phone, message, 'no')
                                            .then(sms => {
                                                bitwebResponse.code = 200;
                                                updateItem._doc['successYn'] = "Y";
                                                let resData = {
                                                    "item": updateItem,
                                                    "vtrTemp": addVtrTemp,
                                                    "vtr": addVtr,
                                                    "sms": sms,
                                                    "coin": updateCoin,
                                                    "escrow": addEscrow,
                                                    "escrowHistory": reqDataEscrow,
                                                    "coinHistory": reqCoinHistoryData
                                                }
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, resData);
                    
                                                bitwebResponse.code = 200;
                                                bitwebResponse.data = Object.assign({}, updateItem);
                                                res.status(200).send(bitwebResponse.create())
                                            }).catch((err) => {
                                                console.error('send sms error =>', err)
                                                bitwebResponse.code = 200;
                                                updateItem._doc['successYn'] = "Y";
                                                let resData = {
                                                    "item": updateItem,
                                                    "vtrTemp": addVtrTemp,
                                                    "vtr": addVtr,
                                                    "sms": err,
                                                    "coin": updateCoin,
                                                    "escrow": addEscrow,
                                                    "escrowHistory": reqDataEscrow,
                                                    "coinHistory": reqCoinHistoryData
                                                }
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, resData);
                    
                                                bitwebResponse.code = 200;
                                                bitwebResponse.data = Object.assign({}, updateItem);
                                                res.status(200).send(bitwebResponse.create())
                                            });
                                        } else if(req.headers.origin.indexOf("marketmach") > 0) {
                                            shortUrl.short(encodeURIComponent(url), function (err, resultUrl) {
                                                let message = whoReqUser + smsMessage + resultUrl;
                                                console.log("Send SMS Message => ", message);
                                                smsController.sendSms(phone, message)
                                                .then(sms => {
                                                    bitwebResponse.code = 200;
                                                    updateItem._doc['successYn'] = "Y";
                                                    let resData = {
                                                        "item": updateItem,
                                                        "vtrTemp": addVtrTemp,
                                                        "vtr": addVtr,
                                                        "sms": sms,
                                                        "coin": updateCoin,
                                                        "escrow": addEscrow,
                                                        "escrowHistory": reqDataEscrow,
                                                        "coinHistory": reqCoinHistoryData
                                                    }
                                                    //API 처리 결과 별도 LOG로 남김
                                                    logger.addLog(country, req.originalUrl, req.body, resData);
                        
                                                    bitwebResponse.code = 200;
                                                    bitwebResponse.data = Object.assign({}, updateItem);
                                                    res.status(200).send(bitwebResponse.create())
                                                }).catch((err) => {
                                                    console.error('send sms error =>', err)
                                                    bitwebResponse.code = 200;
                                                    updateItem._doc['successYn'] = "Y";
                                                    let resData = {
                                                        "item": updateItem,
                                                        "vtrTemp": addVtrTemp,
                                                        "vtr": addVtr,
                                                        "sms": err,
                                                        "coin": updateCoin,
                                                        "escrow": addEscrow,
                                                        "escrowHistory": reqDataEscrow,
                                                        "coinHistory": reqCoinHistoryData
                                                    }
                                                    //API 처리 결과 별도 LOG로 남김
                                                    logger.addLog(country, req.originalUrl, req.body, resData);
                        
                                                    bitwebResponse.code = 200;
                                                    bitwebResponse.data = Object.assign({}, updateItem);
                                                    res.status(200).send(bitwebResponse.create())
                                                });
                                            });
                                        } else {
                                            bitwebResponse.code = 200;
                                            updateItem._doc['successYn'] = "Y";
                                            let resData = {
                                                "item": updateItem,
                                                "vtrTemp": addVtrTemp,
                                                "vtr": addVtr,
                                                "sms": "no",
                                                "coin": updateCoin,
                                                "escrow": addEscrow,
                                                "escrowHistory": reqDataEscrow,
                                                "coinHistory": reqCoinHistoryData
                                            }
                                            //API 처리 결과 별도 LOG로 남김
                                            logger.addLog(country, req.originalUrl, req.body, resData);
                
                                            bitwebResponse.code = 200;
                                            bitwebResponse.data = Object.assign({}, updateItem);
                                            res.status(200).send(bitwebResponse.create())
                                        }
                                    }).catch((err) => {
                                        console.error('add escrow error =>', err);
                                        let resErr = "처리중 에러 발생";
                                        //API 처리 결과 별도 LOG로 남김
                                        logger.addLog(country, req.originalUrl, req.body, err);             
            
                                        bitwebResponse.code = 500;
                                        bitwebResponse.message = resErr;
                                        res.status(500).send(bitwebResponse.create())
                                    })
                                }).catch((err) => {
                                    console.error('update coin error =>', err);
                                    let resErr = "처리중 에러 발생";
                                    //API 처리 결과 별도 LOG로 남김
                                    logger.addLog(country, req.originalUrl, req.body, err);
            
                                    bitwebResponse.code = 500;
                                    bitwebResponse.message = resErr;
                                    res.status(500).send(bitwebResponse.create())
                                })
                            }).catch((err) => {
                                console.error('add vtr error =>', err);
                                let resErr = "처리중 에러 발생";
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, err);
                                
                                bitwebResponse.code = 500;
                                bitwebResponse.message = resErr;
                                res.status(500).send(bitwebResponse.create())
                            })
                        }).catch((err) => {
                            console.error('add vtr error =>', err);
                            let resErr = "처리중 에러 발생";
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, err);
                            
                            bitwebResponse.code = 500;
                            bitwebResponse.message = resErr;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                        console.error('add vtrTemp error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
                                    
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })
                }).catch((err) => {
                    console.error('get coin error =>', err);
                    let resErr = "처리중 에러 발생";
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, err);
        
                    bitwebResponse.code = 500;
                    bitwebResponse.message = resErr;
                    res.status(500).send(bitwebResponse.create())
                })
            }).catch((err) => {
                console.error('add vtrTemp error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);
                            
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('add vtrTemp error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
                        
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
}

function _reqCancelBuyNow(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let reqUserTag = req.body.reqUserTag;
    let conditionItem = {
        "_id": itemId
    }

    serviceUsers.detail(country, {"userTag":reqUserTag}) 
    .then(user => {
        serviceVtrs.detail(country, {"item._id":itemId})
        .then(vtr => {
            if(vtr._doc.buy_status != undefined && user._doc._id.toString() == vtr._doc.to_userId.toString()) {
                let msg = {};
                // if(vtr._doc.sell_status == undefined) {
                //     msg = {
                //         "successYn":"N",
                //         "code": 32,
                //         "msg": '현재 상태에서는 거래취소가 불가능합니다. 판매자님에게 환불을 요청하세요.'
                //     }
                // } else {
                //     if(vtr._doc.completed == undefined) {
                //         msg = {
                //             "successYn":"N",
                //             "code": 42,
                //             "msg": '현재 상태에서는 거래취소가 불가능합니다. 판매자님에게 환불을 요청하거나 사이트에서 이의신청 해주세요.'
                //         }
                //     } else {
                //         msg = {
                //             "successYn":"N",
                //             "code": 52,
                //             "msg": '거래가 완료되어 거래취소하실 수 없습니다.'
                //         }
                //     }
                // }
                if(vtr._doc.completed == undefined) {
                    msg = {
                        "successYn":"N",
                        "code": 42,
                        "msg": '현재 상태에서는 거래취소가 불가능합니다. 판매자님에게 환불을 요청하거나 사이트에서 이의신청 해주세요.'
                    }
                } else {
                    msg = {
                        "successYn":"N",
                        "code": 52,
                        "msg": '거래가 완료되어 거래취소하실 수 없습니다.'
                    }
                }

                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, msg);
    
                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create());
                return;
            }

            if(vtr._doc.completed != undefined) {
                //거래 완료된 경우 취소 요청 불가
                let msg = {
                    "successYn":"N",
                    "code": 52,
                    "msg": '거래가 완료되어 거래취소하실 수 없습니다.'
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, msg);
    
                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create());
                return;
            }


            //단순 거래 취소
            let reqItem = {
                "status": 0
            };

            serviceItems.modify(country, conditionItem, reqItem)
            .then(updatedItem => {
                if(vtr._doc.buy_status == undefined) {
                    serviceVtrs.remove(country, {"_id":vtr._doc._id})
                    .then(deletedVtr => {
                        serviceVtrTemps.remove(country, {"item._id":itemId});

                        let msg = {
                            "successYn":"Y",
                            "code": 31,
                            "msg": '구매자님이 거래를 취소 하였습니다.'
                        }

                        if(user._doc._id.toString() != vtr._doc.to_userId.toString()) {
                            msg = {
                                "successYn":"Y",
                                "code": 41,
                                "msg": '판매자님이 거래를 취소 하였습니다.'
                            }
                        }

                        let resData = {
                            "result":msg,
                            "vtr": deletedVtr,
                            "item": updatedItem
                        }
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, resData);

                        bitwebResponse.code = 200;
                        bitwebResponse.data = msg;
                        res.status(200).send(bitwebResponse.create())
                    }).catch((err) => {
                        console.error('delete vtr error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
                
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })  
                } else {
                    //환불 및 거래 취소
                    serviceUsers.detail(country, {"_id":vtr._doc.to_userId}) 
                    .then(to_user => {
                        serviceCoin.detail(country, {"_id":to_user._doc.coinId})
                        .then((coin) => {                            
                            let user_price = coin.total_mach;
                            if(vtr._doc.cryptoCurrencyCode == "BTC") {
                                user_price = coin.total_btc == undefined ? 0 : coin.total_btc;
                            } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                                user_price = coin.total_ether == undefined ? 0 : coin.total_ether;
                            }

                            let reqData = {
                                'status': 0,
                                'vtr': ''
                            };

                            serviceItems.modify(country, conditionItem, reqData)
                            .then((updateItem) => {              
                                //판매자 에스크로 금액 입금
                                let result_price = parseFloat((user_price + vtr._doc.price).toFixed(8));
                                let reqDataCoin = {"total_mach": result_price};
                                if(vtr._doc.cryptoCurrencyCode == "BTC") {
                                    reqDataCoin = {"total_btc": result_price};
                                } else if(vtr._doc.cryptoCurrencyCode == "ETH") {
                                    reqDataCoin = {"total_ether": result_price};
                                }   
                                
                                serviceCoin.modify(country, {"_id":to_user._doc.coinId}, reqDataCoin)
                                .then(updateCoin => {
                                    let reqDataEscrow = {
                                        'status':'cancelled',
                                        'cancelled_regDate': util.formatDate(new Date().toString())
                                    }
                                    console.log('req escrow data =>', reqDataEscrow);
                                    serviceEscrow.modify(country,{'vtrId':vtr._doc._id},reqDataEscrow)
                                    .then((modifyEscrow)=> {
                                        let reqDataEscrowHistory = {
                                            "type": "cancel",
                                            "itemId": itemId,
                                            "vtr": vtr,
                                            "cryptoCurrencyCode": vtr._doc.cryptoCurrencyCode,                                                                                           
                                            "price": vtr._doc.price,
                                            "reqUser": to_user._doc._id,
                                            "regDate": util.formatDate(new Date().toString())
                                        };
                                        reqDataEscrowHistory['escrowId'] = modifyEscrow._doc._id;
                                        console.log('req escrow history data =>', reqDataEscrow);
                                        serviceEscrowHistory.add(country, reqDataEscrowHistory);
                                        
                                        let reqCoinHistoryData = {
                                            "extType" : "mach",
                                            "coinId" : to_user._doc.coinId,
                                            "category" : "deposit",
                                            "status" : "success",
                                            "currencyCode" : vtr._doc.cryptoCurrencyCode,
                                            "amount" : vtr._doc.price,
                                            "price" : vtr._doc.price,
                                            "regDate" : util.formatDate(new Date().toString())
                                        }
                                        serviceCoinHistory.add(country,reqCoinHistoryData);

                                        let reqCancelHistory = {
                                            "vtr": vtr,
                                            "item": vtr._doc.item,
                                            "from_userId": vtr._doc.from_userId,
                                            "to_userId": vtr._doc.to_userId,
                                            "status": "user_cancel",
                                            "refund": vtr._doc.buy_status == undefined ? false : true,
                                            "regDate": util.formatDate(new Date().toString())
                                        };
                                        serviceCancelHistory.add(country, reqCancelHistory)
                                        .then(() => {
                                            serviceVtrs.remove(country, {"_id":vtr._doc._id})
                                            .then(deletedVtr => {
                                                serviceVtrTemps.remove(country, {"item._id":itemId});
                                                let msg = {
                                                    "successYn":"Y",
                                                    "code": 31,
                                                    "msg": '구매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.'
                                                }
                        
                                                if(user._doc._id.toString() != vtr._doc.to_userId.toString()) {
                                                    msg = {
                                                        "successYn":"Y",
                                                        "code": 41,
                                                        "msg": '판매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.'
                                                    }
                                                }
                                                
                                                let resData = {
                                                    "result":msg,
                                                    "vtr": deletedVtr,
                                                    "item": updateItem,
                                                    "coin": updateCoin,
                                                    "escrow": modifyEscrow,
                                                    "escrowHistory": reqDataEscrow,
                                                    "coinHistory": reqCoinHistoryData
                                                }
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, resData);
                    
                                                bitwebResponse.code = 200;
                                                bitwebResponse.data = msg;
                                                res.status(200).send(bitwebResponse.create())
                                            }).catch((err) => {
                                                console.error('delete vtr error =>', err);
                                                let resErr = "처리중 에러 발생";
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, err);
                                        
                                                bitwebResponse.code = 500;
                                                bitwebResponse.message = resErr;
                                                res.status(500).send(bitwebResponse.create())
                                            })  
                                        })
                                    }).catch((err) => {
                                        console.error('add escrow error =>', err);
                                        let resErr = "처리중 에러 발생";
                                        //API 처리 결과 별도 LOG로 남김
                                        logger.addLog(country, req.originalUrl, req.body, err);
            
                                        bitwebResponse.code = 500;
                                        bitwebResponse.message = resErr;
                                        res.status(500).send(bitwebResponse.create())
                                    })
                                }).catch((err) => {
                                    console.error('update coin error =>', err);
                                    let resErr = "처리중 에러 발생";
                                    //API 처리 결과 별도 LOG로 남김
                                    logger.addLog(country, req.originalUrl, req.body, err);
            
                                    bitwebResponse.code = 500;
                                    bitwebResponse.message = resErr;
                                    res.status(500).send(bitwebResponse.create())
                                })
                            }).catch((err) => {
                                console.error('add vtr error =>', err);
                                let resErr = "처리중 에러 발생";
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, err);
            
                                bitwebResponse.code = 500;
                                bitwebResponse.message = resErr;
                                res.status(500).send(bitwebResponse.create())
                            })
                        }).catch((err) => {
                            console.error('get coin error =>', err);
                            let resErr = "처리중 에러 발생";
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, err);
                
                            bitwebResponse.code = 500;
                            bitwebResponse.message = resErr;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                        console.error('get user error =>', err);
                        let resErr = "처리중 에러 발생";
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
                
                        bitwebResponse.code = 500;
                        bitwebResponse.message = resErr;
                        res.status(500).send(bitwebResponse.create())
                    })  
                }
            }).catch((err) => {
                console.error('modify item error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);
        
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })  
        }).catch((err) => {
            console.error('get vtr error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);

            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })  
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
}

module.exports = router;