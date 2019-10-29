/**
 * 포인트 거래 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-10-28
 */
var express = require('express');
var router = express.Router();
let shortUrl = require('node-url-shortener');
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let serviceItems = require('../../../service/items');
let serviceUsers = require('../../../service/users');
let servicePointTrades = require('../../../service/pointTrades');
let serviceVtrTemps = require('../../../service/vtrTemps');
let servicePoint = require('../../../service/points');
let servicePointHistory = require('../../../service/pointHistorys');
let serviceCancelHistory = require('../../../service/cancelHistorys');
let serviceEscrow = require('../../../service/escrows');
let serviceEscrowHistory = require('../../../service/escrowHistorys');
let smsController = require('../../../service/sms');
let smsContent = require('../../../../../config/smsMessage');
let logger = require('../../../utils/log');
let token = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')

//포인트 거래 API
router.post('/:itemId/step/:stepValue', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let stepValue = req.params.stepValue;

    switch(stepValue) {
        // case "0":
        //     //VTR 거래 요청(방생성)
        //     _createPointTrade(req, res, bitwebResponse);
        //     break;
        // case "1":
        //     //거래 시작
        //     _startTrade(req, res, bitwebResponse);
        //     break;
        // case "2":
        //     //구매 확인
        //     _reqBuy(req, res, bitwebResponse);
        //     break;
        case "3":
            //판매 완료
            _reqSell(req, res, bitwebResponse);
            break;
        case "4":
            //거래 완료
            _reqComplete(req, res, bitwebResponse);
            break;
        // case "5":
        //     //거래 취소
        //     _reqCancel(req, res, bitwebResponse);
        //     break;
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

async function _reqSell(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let conditionItem = {
        "_id": itemId
    }
    
    try {
        let pointTrade = await servicePointTrades.detail(country, {"item._id": itemId})
        //아이템 status 값이 101이거나 104 이상인 경우면 실패로 처리
        if(pointTrade._doc.item.status == 101 || pointTrade._doc.item.status >= 104) {
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
        if(pointTrade._doc.item.category == "game") {
            auto_completed_confirm_date = util.calculateDate(currentDate, "D", 1);
        } 
        //판매완료 시 상태값을 update한다.
        let reqPointTrade = {
            "sell_status" : true,
            "completed_sell_date" : util.formatDate(new Date().toString()),
            "auto_completed_confirm_date": auto_completed_confirm_date,
            "item.status": 103
        };
        let modifyPointTrade = await servicePointTrades.modify(country, {"item._id": itemId}, reqPointTrade)
        let reqData = {
            'status': 103,
            'pointTrade': modifyPointTrade
        };

        let updateVtrTemp = await serviceVtrTemps.modify(country, {"roomToken": pointTrade._doc.roomToken}, {"item.status": 103})
        let updateItem = await serviceItems.modify(country, conditionItem, reqData)
        updateItem._doc['successYn'] = "Y"; 
        let resData = {
            "pointTrade": modifyPointTrade,
            "item": updateItem,
            "vtrTemp": updateVtrTemp
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = Object.assign({}, updateItem);
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('add vtr error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
}

async function _reqComplete(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let conditionItem = {
        "_id": itemId
    }
    
    try {
        let pointTrade = await servicePointTrades.detail(country, {"item._id": itemId})
        //아이템 status 값이 102 이하거나 105 이상인 경우면 실패로 처리
        if(pointTrade._doc.item.status <= 102 || pointTrade._doc.item.status >= 104) {
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
            "_id":pointTrade._doc.from_userId
        }

        let user = await serviceUsers.detail(country, conditionUser)
        let conditionPoint = {
            "_id": user._doc.pointId
        }

        let point = await servicePoint.detail(country, conditionPoint)
        let user_price = point.total_point;
        
        //아이템 상태 정보 update.    
        let reqPoint = {
            "confirm_status": true,
            "completed" : true,
            "completed_confirm_date": util.formatDate(new Date().toString()),
            "completed_date" : util.formatDate(new Date().toString()),
            "item.status": 104
        };
        let modifyPointTrade = await servicePointTrades.modify(country, {"item._id": itemId}, reqPoint)
        let reqData = {
            'status': 104,
            'pointTrade': modifyPointTrade
        };

        let updateVtrTemp = await serviceVtrTemps.modify(country, {"roomToken": pointTrade._doc.roomToken}, {"item.status": 104})
        let updateItem = await serviceItems.modify(country, conditionItem, reqData)
        //판매자 에스크로 금액 입금
        let result_price = parseFloat((user_price + pointTrade._doc.point).toFixed(8));
        let reqDataPoint = {"total_point": result_price};      
        let reqDataEscrow = {
            'status':'completed',
            'completed_regDate': util.formatDate(new Date().toString())
        }
        let modifyEscrow = await serviceEscrow.modify(country,{'tradePointId':modifyPointTrade._doc._id},reqDataEscrow)
        
        let reqDataEscrowHistory = {
            "type": "withdraw",
            "itemId": updateItem._doc._id,
            "pointTrade": pointTrade,
            //"cryptoCurrencyCode": "POINT",                                                                                           
            "point": pointTrade._doc.point,
            "reqUser":pointTrade._doc.from_userId,                                    
            "regDate": util.formatDate(new Date().toString())
        };
        reqDataEscrowHistory['escrowId'] = modifyEscrow._doc._id;
        let addEscrowHistory = await serviceEscrowHistory.add(country, reqDataEscrowHistory);
                                    
        let reqPointHistoryData = {
            "extType" : "mach",
            "pointId" : user._doc.pointId,
            "type" : "deposit",
            "status" : "true",
            "amountCurrency" : "POINT",
            "amount" : pointTrade._doc.point,
            "point" : pointTrade._doc.point,
            "fee": 0,
            "totalPrice": result_price,
            "regDate" : util.formatDate(new Date().toString())
        }

        let addPointHistory = await servicePointHistory.add(country,reqPointHistoryData)
        let updatePoint = await servicePoint.modify(country, conditionPoint, reqDataPoint)
        updateItem._doc['successYn'] = "Y";
        let resData = {
            "pointTrade": modifyPointTrade,
            "item": updateItem,
            "VtrTemp": updateVtrTemp,
            "point": updatePoint,
            "escrow": modifyEscrow,
            "escrowHistory": addEscrowHistory,
            "pointHistory": addPointHistory
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = Object.assign({}, updateItem);
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('point complete error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
}

async function _buynow(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let body = req.body;
    let country = dbconfig.country;
    let conditionUser = {
        "userTag": {$in:[body.sellerTag, body.buyerTag]}
    }
    let conditionItem = {
        "_id": itemId
    }

    try {
        //사용자 조회
        let users = await serviceUsers.list(country, conditionUser)
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
        let item = await serviceItems.detail(country, conditionItem);
        let roomToken = body.buyerTag+"|"+ body.sellerTag+"|"+itemId;  
        item._doc.status = 102;
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

        //구매자 point 조회
        let to_user = await serviceUsers.detail(country, {"_id":userInfo.to_userId})
        let conditionPoint = {
            "_id": to_user._doc.pointId
        }
            
        let point = await servicePoint.detail(country, conditionPoint)
        let user_price = point.total_point;
        
        if (user_price < 0 || user_price < body.price) {
            let message = "거래할 금액이 부족합니다. [나의페이지-포인트입금]에서 포인트를 먼저 충전하세요.";
            if(req.body.country != "KR") {
                message = "Your balance is not enough to trade. You can deposit on [My page - Deposit Point].";
            }
            let msg = {
                "successYn": "N",
                "code" : "E001",
                "msg" : message
            };
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, msg);

            bitwebResponse.code = 200;
            bitwebResponse.data = msg;
            res.status(200).send(bitwebResponse.create());
            return;
        } 

        //1. PointTrade 방 생성
        let addPointTradeTemp = await serviceVtrTemps.add(country, reqData)
        //PointTrade 정보를 추가한다.
        //아이템 상태 정보 update, 거래 요청 시 요청 가격이 틀리면 가격도 update한다.        
        let reqPointTrade = Object.assign({}, body, userInfo);
        reqPointTrade['vtrTempId'] = addPointTradeTemp._doc._id;
        reqPointTrade['item'] = item;
        reqPointTrade['regDate'] = util.formatDate(new Date().toString())
        reqPointTrade["buy_status"] = true;
        reqPointTrade["completed_buy_date"] = util.formatDate(new Date().toString());
        if(item._doc.category == "game") {
            if (item._doc.trade_type == "buy") {
                reqPointTrade['buyer_game_character'] = item._doc.game_character;
                reqPointTrade['seller_game_character'] = item._doc.target_game_character;
            } else {
                reqPointTrade['buyer_game_character'] = item._doc.target_game_character;
                reqPointTrade['seller_game_character'] = item._doc.game_character;
            }
        }    
        reqPointTrade["roomToken"] = roomToken;
        //2. PointTrade 거래 요청
        let addPointTrade = await servicePointTrades.add(country, reqPointTrade)
        let modifyItemData = {
            'status': 102,
            'tradePointId': addPointTrade._doc._id,
            'pointTrade': reqPointTrade
        };

        // 3. item 상태 수정
        let updateItem = await serviceItems.modify(country, conditionItem, modifyItemData)
        
        //4. 구매자 coin 차감 및 에스크로
        let result_price = parseFloat((user_price - addPointTrade._doc.point).toFixed(8));
        let reqDataPoint = {"total_point": result_price};
        
        let reqDataEscrow = {
            'tradePointId': addPointTrade._doc._id,
            'itemId': updateItem._doc._id,
            'cryptoCurrencyCode': "POINT",    
            'price': addPointTrade._doc.point,
            'sellerUser': addPointTrade._doc.from_userId,
            'buyerUser': addPointTrade._doc.to_userId,
            'status':'processing',
            'regDate': util.formatDate(new Date().toString())
        }
        let addEscrow = await serviceEscrow.add(country,reqDataEscrow)
        let reqDataEscrowHistory = {
            "type": "deposit",
            "itemId": updateItem._doc._id,
            "pointTrade": addPointTrade,
            // 'cryptoCurrencyCode': "POINT",    
            "point": addPointTrade._doc.point,
            "reqUser":addPointTrade._doc.to_userId,
            "regDate": util.formatDate(new Date().toString())
        };
        reqDataEscrowHistory['escrowId'] = addEscrow._doc._id;
        let addEscrowHistory = await serviceEscrowHistory.add(country, reqDataEscrowHistory);
                                        
        let reqPointHistoryData = {
            "extType" : "mach",
            "pointId" : to_user._doc.pointId,
            "type" : "withdraw",
            "status" : "true",
            "amountCurrency" : "POINT",
            "amount" : addPointTrade._doc.point,
            "point" : addPointTrade._doc.point,
            "fee": 0,
            "totalPrice": result_price,
            "regDate" : util.formatDate(new Date().toString())
        }
        let addHistory = await servicePointHistory.add(country,reqPointHistoryData)
        let updatePoint = await servicePoint.modify(country, conditionPoint, reqDataPoint)
        //5.SMS전송
        let phone = userInfo.seller_phone;
        let whoReqUser = body.buyerTag;
        let smsMessage = smsContent.notification.ko;
        if(body.country != "KR") {
            smsMessage = smsContent.notification.en;
        }
        //let url = dbconfig.smsUrlCommon + '/sms/room?roomToken='+updateItem._doc.roomToken+'&itemId=' + updateItem._doc._id + '&user_id=' + updateItem._doc.userTag + '&vtrTempId=' + addVtrTemp._doc._id;
        let category = "/sells";                            
        if(updateItem._doc.trade_type == "buy") {
            category = "/buys";
        }

        if(updateItem._doc.category == "etc") {
            category = "/etc-sells";
            if(updateItem._doc.trade_type == "buy") {
                category = "/etc-buys";
            }
        } else if(updateItem._doc.category == "otc") {
            category = "/otc-sells";
            if(updateItem._doc.trade_type == "buy") {
                category = "/otc-buys";
            }
        }

        let url = dbconfig.smsUrlCommon + category + '/detail/' + itemId;
        if(updateItem._doc.trade_type == "buy") {
            whoReqUser = sellerTag;
            phone = userInfo.buyer_phone;
        } 

        if(dbconfig.smsUrlCommon.indexOf("marketmach") >= 0) {
            shortUrl.short(encodeURIComponent(url), function (err, resultUrl) {
                let message = whoReqUser + smsMessage + resultUrl;
                console.log("Send SMS Message => ", message);
                smsController.sendSms(phone, message)
                .then(sms => {
                    bitwebResponse.code = 200;
                    updateItem._doc['successYn'] = "Y";
                    let resData = {
                        "vtrTemp": addPointTradeTemp,
                        "pointTrade": addPointTrade,
                        "item": updateItem,
                        "sms": sms,
                        "point": updatePoint,
                        "escrow": addEscrow,
                        "escrowHistory": addEscrowHistory,
                        "pointHistory": addHistory
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
                        "vtrTemp": addPointTradeTemp,
                        "pointTrade": addPointTrade,
                        "item": updateItem,
                        "sms": err,
                        "point": updatePoint,
                        "escrow": addEscrow,
                        "escrowHistory": addEscrowHistory,
                        "pointHistory": addHistory
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.code = 200;
                    bitwebResponse.data = Object.assign({}, updateItem);
                    res.status(200).send(bitwebResponse.create())
                });
            });
        } else {
            let message = whoReqUser + smsMessage + itemId;
            console.log("Send SMS Message => ", message);
            smsController.sendSms(phone, message, 'no')
            .then(sms => {
                bitwebResponse.code = 200;
                updateItem._doc['successYn'] = "Y";
                let resData = {
                    "vtrTemp": addPointTradeTemp,
                    "pointTrade": addPointTrade,
                    "item": updateItem,
                    "sms": sms,
                    "point": updatePoint,
                    "escrow": addEscrow,
                    "escrowHistory": addEscrowHistory,
                    "pointHistory": addHistory
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
                    "vtrTemp": addPointTradeTemp,
                    "pointTrade": addPointTrade,
                    "item": updateItem,
                    "sms": err,
                    "point": updatePoint,
                    "escrow": addEscrow,
                    "escrowHistory": addEscrowHistory,
                    "pointHistory": addHistory
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, resData);

                bitwebResponse.code = 200;
                bitwebResponse.data = Object.assign({}, updateItem);
                res.status(200).send(bitwebResponse.create())
            });
        }
    } catch(err) {
        console.error('update coin error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);             

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
}

async function _reqCancelBuyNow(req, res, bitwebResponse) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let reqUserTag = req.body.reqUserTag;
    let roomToken = req.body.roomToken;
    let conditionItem = {
        "_id": itemId
    }

    try {
        let user = await serviceUsers.detail(country, {"userTag":reqUserTag}) 
        //기존 검색 조건. {"item._id":itemId}
        let pointTrade = await servicePointTrades.detail(country, {"item._id":itemId, $or:[{from_userId:user._doc._id}, {to_userId:user._doc._id}]})
        if(pointTrade == null) {
            // 멀티방이 남아 있는 경우 vtrtemp만 삭제한다.
            let reqItem = {
                "status": 0
            };

            let deletedVtrTemp = await serviceVtrTemps.remove(country, {"roomToken":roomToken})
            let vtrTemps = await serviceVtrTemps.list(country, {'item._id': itemId})
            if(vtrTemps.length == 0) {
                let updatedItem = await serviceItems.modify(country, conditionItem, reqItem)
                let message = '거래를 취소 하였습니다.';
                // if(req.body.country != "KR") {
                //     message = 'The Buyer canceled the transaction.';
                // }

                let msg = {
                    "successYn":"Y",
                    "code": 31,
                    "msg": message
                }

                let resData = {
                    "result":msg,
                    "vtrTemp": deletedVtrTemp,
                    "item": updatedItem
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, resData);

                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create())
            } else {
                let message = '거래를 취소 하였습니다.';
                // if(req.body.country != "KR") {
                //     message = 'The Buyer canceled the transaction.';
                // }

                let msg = {
                    "successYn":"Y",
                    "code": 31,
                    "msg": message
                }

                let resData = {
                    "result":msg,
                    "vtrTemp": deletedVtrTemp,
                    "item": "no"
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, resData);

                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create())
            }
        } else {
            if(pointTrade._doc.buy_status != undefined && user._doc._id.toString() == pointTrade._doc.to_userId.toString()) {
                let msg = {};
                if(pointTrade._doc.completed == undefined) {
                    let message = '현재 상태에서는 거래취소가 불가능합니다. 판매자님에게 환불을 요청해주세요.';
                    // if(req.body.country != "KR") {
                    //     message = 'You can not cancel your transaction at this time. Please request a refund from the seller.';
                    // }

                    msg = {
                        "successYn":"N",
                        "code": 42,
                        "msg": message
                    }
                } else {
                    let message = '거래가 완료되어 거래취소하실 수 없습니다.';
                    // if(req.body.country != "KR") {
                    //     message = 'Your transaction is complete and you can not cancel your transaction.';
                    // }

                    msg = {
                        "successYn":"N",
                        "code": 52,
                        "msg": message
                    }
                }

                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, msg);

                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create());
                return;
            }

            if(pointTrade._doc.completed != undefined) {
                //거래 완료된 경우 취소 요청 불가
                let message = '거래가 완료되어 거래취소하실 수 없습니다.';
                // if(req.body.country != "KR") {
                //     message = 'Your transaction is complete and you can not cancel your transaction.';
                // }
                
                let msg = {
                    "successYn":"N",
                    "code": 52,
                    "msg": message
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
                "status": 0,
                'tradePointId': ''
            };

            if(pointTrade._doc.buy_status == undefined) {
                let deletedPointTrade = await servicePointTrades.remove(country, {"_id":pointTrade._doc._id})
                let deletedVtrTemp = await serviceVtrTemps.remove(country, {"item._id":itemId})
                let vtrTemps = await serviceVtrTemps.list(country, {'item._id': itemId})
                if(vtrTemps.length == 0) {
                    let updatedItem = await serviceItems.modify(country, conditionItem, reqItem)
                    let from_message = '구매자님이 거래를 취소 하였습니다.';
                    // if(req.body.country != "KR") {
                    //     from_message = 'The buyer canceled the transaction.';
                    // }

                    let msg = {
                        "successYn":"Y",
                        "code": 31,
                        "msg": from_message
                    }

                    if(user._doc._id.toString() != pointTrade._doc.to_userId.toString()) {
                        let to_message = '판매자님이 거래를 취소 하였습니다.';
                        // if(req.body.country != "KR") {
                        //     to_message = 'The seller canceled the transaction.';
                        // }
                        msg = {
                            "successYn":"Y",
                            "code": 41,
                            "msg": to_message
                        }
                    }

                    let resData = {
                        "result":msg,
                        "pointTrade": deletedPointTrade,
                        "vtrTemp": deletedVtrTemp,
                        "item": updatedItem
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.code = 200;
                    bitwebResponse.data = msg;
                    res.status(200).send(bitwebResponse.create())
                } else {
                    let from_message = '구매자님이 거래를 취소 하였습니다.';
                    // if(req.body.country != "KR") {
                    //     from_message = 'The buyer canceled the transaction.';
                    // }

                    let msg = {
                        "successYn":"Y",
                        "code": 31,
                        "msg": from_message
                    }

                    if(user._doc._id.toString() != pointTrade._doc.to_userId.toString()) {
                        let to_message = '판매자님이 거래를 취소 하였습니다.';
                        // if(req.body.country != "KR") {
                        //     to_message = 'The seller canceled the transaction.';
                        // }
                        msg = {
                            "successYn":"Y",
                            "code": 41,
                            "msg": to_message
                        }
                    }

                    let resData = {
                        "result":msg,
                        "pointTrade": deletedPointTrade,
                        "vtrTemp": deletedVtrTemp,
                        "item": "no"
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.code = 200;
                    bitwebResponse.data = msg;
                    res.status(200).send(bitwebResponse.create())
                }         
            } else {
                //환불 및 거래 취소
                let to_user = await serviceUsers.detail(country, {"_id":pointTrade._doc.to_userId}) 
                let point = await servicePoint.detail(country, {"_id":to_user._doc.pointId})                
                let user_price = point.total_point;
                        
                let reqData = {
                    'status': 0,
                    'pointTrade': '',
                    'tradePointId': ''
                };

                let deletedPointTrade = await servicePointTrades.remove(country, {"_id":pointTrade._doc._id})
                let deletedVtrTemp = await serviceVtrTemps.remove(country, {"item._id":itemId})
                let vtrTemps = await serviceVtrTemps.list(country, {'item._id': itemId})
                if(vtrTemps.length == 0) {
                    let updateItem = await serviceItems.modify(country, conditionItem, reqData)
                    //판매자 에스크로 금액 입금
                    let result_price = parseFloat((user_price + pointTrade._doc.point).toFixed(8));
                    let reqDataPoint = {"total_point": result_price};
                    
                    let reqDataEscrow = {
                        'status':'cancelled',
                        'cancelled_regDate': util.formatDate(new Date().toString())
                    }
                    let modifyEscrow = await serviceEscrow.modify(country,{'tradePointId':pointTrade._doc._id},reqDataEscrow)
                    let reqDataEscrowHistory = {
                        "type": "cancel",
                        "itemId": itemId,
                        "pointTrade": pointTrade,
                        //"cryptoCurrencyCode": "POINT",                                                                                           
                        "point": pointTrade._doc.point,
                        "reqUser": to_user._doc._id,
                        "regDate": util.formatDate(new Date().toString())
                    };
                    reqDataEscrowHistory['escrowId'] = modifyEscrow._doc._id;
                    let addEscrowHistory = await serviceEscrowHistory.add(country, reqDataEscrowHistory);
                            
                    let reqPointHistoryData = {
                        "extType" : "mach",
                        "pointId" : to_user._doc.pointId,
                        "type" : "deposit",
                        "status" : "true",
                        "amountCurrency" : "POINT",
                        "amount" : pointTrade._doc.point,
                        "point" : pointTrade._doc.point,
                        "totalPrice": result_price,
                        "regDate" : util.formatDate(new Date().toString())
                    }
                    let addPointHistory = await servicePointHistory.add(country,reqPointHistoryData);

                    let reqCancelHistory = {
                        "pointTrade": pointTrade,
                        "item": pointTrade._doc.item,
                        "from_userId": pointTrade._doc.from_userId,
                        "to_userId": pointTrade._doc.to_userId,
                        "status": "user_cancel",
                        "refund": pointTrade._doc.buy_status == undefined ? false : true,
                        "regDate": util.formatDate(new Date().toString())
                    };
                    let addCancelHistory = await serviceCancelHistory.add(country, reqCancelHistory)
                    let updatePoint = await servicePoint.modify(country, {"_id":to_user._doc.pointId}, reqDataPoint)
                    let from_message = '구매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.';
                    // if(req.body.country != "KR") {
                    //     from_message = 'The buyer has canceled the transaction. The transaction amount held in the escrow has been refunded to the buyer\'s wallet.';
                    // }

                    let msg = {
                        "successYn":"Y",
                        "code": 31,
                        "msg": from_message
                    }

                    if(user._doc._id.toString() != pointTrade._doc.to_userId.toString()) {
                        let to_message = '판매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.';
                        // if(req.body.country != "KR") {
                        //     to_message = 'The seller has canceled the transaction. The transaction amount held in the escrow has been refunded to the buyer\'s wallet.';
                        // }

                        msg = {
                            "successYn":"Y",
                            "code": 41,
                            "msg": to_message
                        }
                    }
                    
                    let resData = {
                        "result":msg,
                        "pointTrade": deletedPointTrade,
                        "item": updateItem,
                        "point": updatePoint,
                        "escrow": modifyEscrow,
                        "escrowHistory": addEscrowHistory,
                        "pointHistory": addPointHistory
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.code = 200;
                    bitwebResponse.data = msg;
                    res.status(200).send(bitwebResponse.create())
                } else {
                    //판매자 에스크로 금액 입금
                    let result_price = parseFloat((user_price + pointTrade._doc.point).toFixed(8));
                    let reqDataPoint = {"total_point": result_price};                
                    let reqDataEscrow = {
                        'status':'cancelled',
                        'cancelled_regDate': util.formatDate(new Date().toString())
                    }
                    let modifyEscrow = await serviceEscrow.modify(country,{'pointTradeId':pointTrade._doc._id},reqDataEscrow)
                    let reqDataEscrowHistory = {
                        "type": "cancel",
                        "itemId": itemId,
                        "pointTrade": pointTrade,
                        "cryptoCurrencyCode": "POINT",                                                                                           
                        "price": pointTrade._doc.price,
                        "reqUser": to_user._doc._id,
                        "regDate": util.formatDate(new Date().toString())
                    };
                    reqDataEscrowHistory['escrowId'] = modifyEscrow._doc._id;
                    let addEscrowHistory = await serviceEscrowHistory.add(country, reqDataEscrowHistory);
                        
                    let reqPointHistoryData = {
                        "extType" : "mach",
                        "coinId" : to_user._doc.coinId,
                        "type" : "deposit",
                        "status" : "success",
                        "amountCurrency" : "POINT",
                        "amount" : pointTrade._doc.price,
                        "price" : pointTrade._doc.price,
                        "totalPrice": result_price,
                        "regDate" : util.formatDate(new Date().toString())
                    }
                    let addPointHistory = await servicePointHistory.add(country,reqPointHistoryData);

                    let reqCancelHistory = {
                        "pointTrade": pointTrade,
                        "item": pointTrade._doc.item,
                        "from_userId": pointTrade._doc.from_userId,
                        "to_userId": pointTrade._doc.to_userId,
                        "status": "user_cancel",
                        "refund": pointTrade._doc.buy_status == undefined ? false : true,
                        "regDate": util.formatDate(new Date().toString())
                    };
                    let addCancelHistory = await serviceCancelHistory.add(country, reqCancelHistory)
                    let updatePoint = await serviceCoin.modify(country, {"_id":to_user._doc.pointId}, reqDataPoint)
                    let from_message = '구매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.';
                    // if(req.body.country != "KR") {
                    //     from_message = 'The buyer has canceled the transaction. The transaction amount held in the escrow has been refunded to the buyer\'s wallet.';
                    // }

                    let msg = {
                        "successYn":"Y",
                        "code": 31,
                        "msg": from_message
                    }

                    if(user._doc._id.toString() != pointTrade._doc.to_userId.toString()) {
                        let to_message = '판매자님이 거래를 취소 하였습니다.에스크로에 보관된 거래금액이 구매자님의 지갑으로 환불되었습니다.';
                        // if(req.body.country != "KR") {
                        //     to_message = 'The seller has canceled the transaction. The transaction amount held in the escrow has been refunded to the buyer\'s wallet.';
                        // }

                        msg = {
                            "successYn":"Y",
                            "code": 41,
                            "msg": to_message
                        }
                    }
                    
                    let resData = {
                        "result":msg,
                        "pointTrade": deletedPointTrade,
                        "item": "no",
                        "coin": updateCoin,
                        "escrow": modifyEscrow,
                        "escrowHistory": addEscrowHistory,
                        "pointHistory": addPointHistory
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.code = 200;
                    bitwebResponse.data = msg;
                    res.status(200).send(bitwebResponse.create())
                }
            }
        }
    } catch(err) {                     
        console.error('modify escrow error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
}

module.exports = router;