var express = require('express');
var router = express.Router();
let shortUrl = require('node-url-shortener');
let request = require('request');
let dbconfig = require('../../config/dbconfig');
let util = require('../utils/util');
let serviceItems = require('../service/items');
let serviceUsers = require('../service/users');
let serviceVtrTemps = require('../service/vtrTemps');
let serviceCoin = require('../service/coins');
let serviceCoinHistory = require('../service/coinHistorys');
let serviceEscrow = require('../service/escrows');
let serviceEscrowHistory = require('../service/escrowHistorys');
let smsController = require('../service/sms');
let smsContent = require('../config/sms');

//chatbot 에서 VTR 방 생성 시 사용하는 API
router.put('/updateStatus/:itemId', function (req, res, next) {
    let country = dbconfig.country;
    let itemId = req.param.itemId;
    let conditionUser = {
        "userTag": {$in:[req.body.seller_id, req.body.buyer_id]}
    }
    
    let bitwebResponse = new BitwebResponse();
    //사용자 조회
    serviceUsers.list(country, conditionUser)
    .then((users) => {
        // 전화번호가 존재하지 않을 경우 에러 메시지 표시
        for (var i in users) {
            if (users[i]._doc.phone == undefined || users[i]._doc.phone == "") {
                let errMsg = "There is no phone."
                bitwebResponse.code = 403;
                bitwebResponse.data = errMsg;
                res.status(403).send(bitwebResponse.create());
                return;
            }
        }

        let reqData = req.body;
        reqData['country'] = country;

        console.log('req VtrTemp data =>', reqData);
        //vtr 방 생성
        serviceVtrTemps.add(country, reqData)
        .then((addVtrTemp) => {
            let conditionItem = {
                "_id": itemId
            }
            let updateData = {
                "roomToken": req.body.roomToken,
                "status": req.body.status,
                "vtrTempId": addVtrTemp._doc._id
            };

            console.log('update item data =>', updateData);

            //vtr 방 넘버,상태, roomToken값 update
            serviceItems.modify(country, conditionItem, updateData)
            .then((updateItem) => {
                console.log("HOST : ", req.headers.origin);
                
                //SMS전송
                let userInfo = serviceItems.setUserInfoForVtr(users);
                let phone = userInfo.seller_phone;
                let whoReqUser = buyer_id;
                let smsMessage = smsContent.sms.ko;
                let url = req.headers.origin + '/sms/room?roomToken='+updateItem._doc.roomToken+'&itemId=' + updateItem._doc._id + '&user_id=' + updateItem._doc.userTag + '&vtrTempId=' + addVtrTemp._doc._id;
                if(updateItem._doc.trade_type == "buy") {
                    whoReqUser = seller_id;
                    phone = userInfo.buyer_phone;
                } 
                
                if(req.headers.origin.indexOf("marketmach") > 0) {
                    shortUrl.short(encodeURIComponent(url), function (err, resultUrl) {
                        let message = whoReqUser + smsMessage + resultUrl;
                        console.log("Send SMS Message => ", message);
                        smsController.sendSms(phone, message)
                        .then(() => {
                            bitwebResponse.code = 200;
                            console.log("Add VtrTemp => ", addVtrTemp);
                            bitwebResponse.data = url.replace('/sms','');
                            res.status(200).send(bitwebResponse.create())
                        }).catch((err) => {
                            console.error('send sms error =>', err)
                            bitwebResponse.code = 500;
                            bitwebResponse.message = err;
                            res.status(500).send(bitwebResponse.create())
                        });
                    });
                } else {
                    smsController.sendSms(req, res, 'no')
                    .then(() => {
                        bitwebResponse.code = 200;
                        bitwebResponse.data = url.replace('/sms','');
                        res.status(200).send(bitwebResponse.create())
                    }).catch((err) => {
                        console.error('send sms error =>', err)
                        bitwebResponse.code = 500;
                        bitwebResponse.message = err;
                        res.status(500).send(bitwebResponse.create())
                    });
                }
            }).catch((err) => {
                console.error('update item error =>', err);
                let resErr = "처리중 에러 발생";
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('add vtrTemp error =>', err);
            let resErr = "처리중 에러 발생";
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//chatbot 에서 VTR 거래 요청 시 사용하는 API
router.post('/chatbot', function (req, res, next) {
    let country = dbconfig.country;
    let conditionUser = {
        "userTag": {$in:[req.body.from_userId, req.body.to_userId]}
    }
    
    let bitwebResponse = new BitwebResponse();
    serviceUsers.list(country, conditionUser)
    .then((users) => {
        let conditionItem = {
            "_id": req.body.itemId
        }
        
        serviceItems.detail(country, conditionItem, reqData)
        .then((item) => {
            //vtr이 존재하는 경우 거래 진행 중으로 표시 처리
            if(item._doc.vtr == undefined || item._doc.vtr == "") {
                //vtr 정보를 추가한다.
                //아이템 상태 정보 update, 거래 요청 시 요청 가격이 틀리면 가격도 update한다.        
                let userInfo = serviceItems.setUserInfoForVtr(users);
                let vtr = Object.assign({}, req.body, userInfo);
                vtr['country'] = country;
                let reqData = {
                    'status': 1,
                    'price': req.body.mach,
                    'total_price': req.body.mach,
                    'vtr': vtr
                };

                console.log('req Vtr data =>', reqData);
                
                serviceItems.modify(country, conditionItem, reqData)
                .then((updateItem) => {
                    console.log('updated item =>', updateItem);
                    bitwebResponse.code = 200;
                    bitwebResponse.data = updateItem;
                    res.status(200).send(bitwebResponse.create())
                }).catch((err) => {
                    console.error('add vtr error =>', err);
                    let resErr = "처리중 에러 발생";
                    bitwebResponse.code = 500;
                    bitwebResponse.message = resErr;
                    res.status(500).send(bitwebResponse.create())
                })
            } else {
                let msg = {
                    "code" : "E001",
                    "msg" : "해당 아이템은 거래 진행 중입니다. 거래를 진행할 수 없습니다."
                };
                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create())
            }
        }).catch((err) => {
            console.error('get vtr error =>', err);
            let resErr = "처리중 에러 발생";
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })  
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
})

//바로 구매 요청 시 사용하는 API
router.post('/buynow', function (req, res, next) {
    let country = dbconfig.country;
    let conditionUser = {
        "userTag": {$in:[req.body.from_userId, req.body.to_userId]}
    }
    
    let bitwebResponse = new BitwebResponse();
    serviceUsers.list(country, conditionUser)
    .then((users) => {
        let conditionItem = {
            "_id": req.body.itemId
        }
        
        serviceItems.detail(country, conditionItem, reqData)
        .then((item) => {
            //vtr이 존재하는 경우 거래 진행 중으로 표시 처리
            if(item._doc.vtr == undefined || item._doc.vtr == "") {
                //vtr 정보를 추가한다.
                //아이템 상태 정보 update, 거래 요청 시 요청 가격이 틀리면 가격도 update한다.    
                //바로구매인 경우 completed_buy_date를 추가한다.    
                let userInfo = serviceItems.setUserInfoForVtr(users);
                let vtr = Object.assign({}, req.body, userInfo);
                vtr['country'] = country;
                vtr['completed_buy_date'] = util.formatDate(new Date().toString());
                let reqData = {
                    'status': 2,
                    'price': req.body.mach,
                    'total_price': req.body.mach,
                    'vtr': vtr
                };

                console.log('req Vtr data =>', reqData);
                
                serviceItems.modify(country, conditionItem, reqData)
                .then((updateItem) => {              
                    //(TO-DO) : 구매자 coin 에스크로
                    
                    console.log('updated item =>', updateItem);
                    // bitwebResponse.code = 200;
                    // bitwebResponse.data = updateItem;
                    // res.status(200).send(bitwebResponse.create())
                }).catch((err) => {
                    console.error('add vtr error =>', err);
                    let resErr = "처리중 에러 발생";
                    bitwebResponse.code = 500;
                    bitwebResponse.message = resErr;
                    res.status(500).send(bitwebResponse.create())
                })
            } else {
                let msg = {
                    "code" : "E001",
                    "msg" : "해당 아이템은 거래 진행 중입니다. 거래를 진행할 수 없습니다."
                };
                bitwebResponse.code = 200;
                bitwebResponse.data = msg;
                res.status(200).send(bitwebResponse.create())
            }
        }).catch((err) => {
            console.error('get vtr error =>', err);
            let resErr = "처리중 에러 발생";
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })  
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

