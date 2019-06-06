var express = require('express');
var router = express.Router();
var controllerVtrs = require('../controllers/vtrs')
var controllerPoints = require('../controllers/points')
var controllerTradePoints = require('../controllers/pointTrades');
var BitwebResponse = require('../utils/BitwebResponse');
var dbconfig = require('../config/dbconfig');
var util = require('../utils/util');
const smsController = require('../controllers/sms');

router.get('/:tradePointId', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    if (req.params.tradePointId != null) {
        controllerTradePoints.get(req)
            .then(result => {
                bitwebResponse.code = 200;
                bitwebResponse.data = result;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
});

router.get('/user/:userId', function(req, res, next) {
    let pageIdx = req.query.pageIdx;
    let perPage = req.query.perPage;
    let userId = req.params.userId;
    let country = req.session.country;

    let data = {};
    data['userId'] = userId;
    data['country'] = country;
    if (pageIdx != undefined) data['pageIdx'] = parseInt(pageIdx);
    if (perPage != undefined) data['perPage'] = parseInt(perPage);

    var bitwebResponse = new BitwebResponse();
   if(req.params.userId != null) {
       controllerTradePoints.getItemIdsByUserId(data)
           .then(tradePoints => {
               let itemIds = [];
               for(var i in tradePoints) {
                   itemIds.push(tradePoints[i].item._id);
               }
               console.log("itemIds : ", itemIds);
               var controllerItems = require('../controllers/items')

               controllerItems.getItemsByIds(country, itemIds)
                   .then(result => {
                       bitwebResponse.code = 200;
                       bitwebResponse.data = result;
                       res.status(200).send(bitwebResponse.create())
                   }).catch((err) => {
                   console.error('err=>', err)
                   bitwebResponse.code = 500;
                   bitwebResponse.message = err;
                   res.status(500).send(bitwebResponse.create())
               })
           }).catch((err) => {
           console.error('err=>', err)
           bitwebResponse.code = 500;
           bitwebResponse.message = err;
           res.status(500).send(bitwebResponse.create())
       })
   }
});

router.post('/', function (req, res, next) {

    //from_userId = 5bd29ff159ceaf6c52424fef
    //to_userId = 5bd2a05459ceaf6c52424ff0
    //itemId = 5bd2a0c6ab4cf21524d6f734
    let sampleJson =
        {
            "itemId": "1234",
            "pointId": "from_userId의 point ID",
            "trade": "buy/sell",
            "from_userId": "1234", // 아이템 판매자
            "to_userId": "5678", // 아이템 구매자
            "point": 1000
        }

    if (req.body.itemId != null) {
        let data = {}
        let itemId = req.body.itemId;
        let country = req.session.country;

        var bitwebResponse = new BitwebResponse();
        let controllerItems = require('../controllers/items');
        let controllUsers = require('../controllers/users');

        if(req.body.trade == "sell") {
            controllUsers.getByUserTag(country, req.body.from_userId)
                .then(user => {
                    req.body.pointId = user.pointId;
                    req.body.from_userId = user._id;
                    req.body.to_userId = req.session.userId;

                    controllUsers.getById(country, req.body.to_userId)
                        .then(to_user => {
                            let bitwebPoints = require('../controllers/points');
                            let pointId = to_user._doc.pointId;
                            bitwebPoints.getByPointId(country, pointId)
                                .then(points => {
                                    controllerItems.getByItemId(country, itemId, "", "")
                                        .then(item => {
                                            let user_point = points.total_point;
                                            let point = item._doc.point;
                                            user_point = user_point - point;
                                            let point_json = {"total_point": user_point}
                                            bitwebPoints.updateTotalPoint(country, pointId, point_json)
                                                .then(() => {
                                                    delete req.body['itemId'];
                                                    req.body['item'] = item;
                                                    let status = 2; //point 거래 중

                                                    controllerTradePoints.create(req, itemId)
                                                        .then(result => {
                                                            bitwebResponse.code = 200;
                                                            bitwebResponse.data = result;
                                                            res.status(200).send(bitwebResponse.create())
                                                        }).catch((err) => {
                                                        console.error('err=>', err)
                                                        bitwebResponse.code = 500;
                                                        bitwebResponse.message = err;
                                                        res.status(500).send(bitwebResponse.create())
                                                    })
                                                })
                                        })
                                })
                        })
                })
        } else {
            controllUsers.getById(country, req.session.userId)
                .then((fromUser) => {
                    req.body.from_userId = req.session.userId;
                    req.body.pointId = fromUser.pointId;

                    controllUsers.getByUserTag(country, req.body.to_userId)
                        .then(user => {
                            req.body.to_userId = user._id;
                            let bitwebPoints = require('../controllers/points');
                            let pointId = user._doc.pointId;
                            bitwebPoints.getByPointId(country, pointId)
                                .then(points => {
                                    controllerItems.getByItemId(country, itemId, "", "")
                                        .then(item => {
                                            let user_point = points.total_point;
                                            let point = item._doc.point;
                                            user_point = user_point - point;
                                            let point_json = {"total_point": user_point}
                                                bitwebPoints.updateTotalPoint(country, pointId, point_json)
                                                .then(() => {
                                                    delete req.body['itemId'];
                                                    req.body['item'] = item;
                                                    let status = 2; //point 거래 중

                                                    controllerTradePoints.create(req, itemId)
                                                        .then(result => {
                                                            bitwebResponse.code = 200;
                                                            bitwebResponse.data = result;
                                                            res.status(200).send(bitwebResponse.create())
                                                        }).catch((err) => {
                                                        console.error('err=>', err)
                                                        bitwebResponse.code = 500;
                                                        bitwebResponse.message = err;
                                                        res.status(500).send(bitwebResponse.create())
                                                    })
                                                })
                                        });
                                })
                        })
                })
        }
    }
});

router.post('/buynow', function (req, res, next) {
    if (req.body.itemId != null
        && req.body.from_userId != null
        && req.body.to_userId != null) {

        let data = {}
        let itemId = req.body.itemId;
        let country = dbconfig.country;

        var bitwebResponse = new BitwebResponse();
        let controllerItems = require('../controllers/items');

        controllerItems.getByItemId(country, itemId, "", "")
            .then(item => {

                delete req.body['itemId'];
                item._doc.status = 102;
                req.body['item'] = item;

                if(item.point != req.body.point) {
                    item._doc.point = req.body.point;
                    item._doc.total_point = req.body.point;
                }

                let controllerUser = require('../controllers/users');
                let userTags = [req.body.from_userId, req.body.to_userId];

                controllerUser.getByUserTags(country, userTags)
                    .then((users) => {
                        let from_findIndex = users.findIndex((group) => {
                            return group._doc.userTag == req.body.from_userId;
                        });

                        let to_findIndex = users.findIndex((group) => {
                            return group._doc.userTag == req.body.to_userId;
                        });

                        req.body.from_userId = users[from_findIndex];
                        req.body.to_userId = users[to_findIndex];

                        //휴대전화번호 추가
                        req.body['seller_phone'] = users[from_findIndex]._doc.phone;
                        req.body['buyer_phone'] = users[to_findIndex]._doc.phone;
                        if(item._doc.category == "game") {
                            req.body['buyer_game_character'] = req.body.game_character;
                            req.body['seller_game_character'] = item._doc.game_character;
                        }
                        let fromUserTag = req.body.to_userId.userTag;
                        let targetUserTag = item._doc.userTag;

                        req.body['buy_status'] = true;
                        //req.body['sell_status'] = true;
                        req.body['completed_buy_date'] = util.formatDate(new Date().toString());
                        //req.body['completed_sell_date'] = util.formatDate(new Date().toString());

                        controllerTradePoints.getByItemId(country, itemId) 
                            .then(tradePoint => {
                                if(tradePoint == null) {
                                    controllerUser.getById(country, req.body.to_userId)
                                        .then(user => {
                                            let pointId = user._doc.pointId;
                                            controllerPoints.getByPointId(country, pointId)
                                                .then(point => {
                                                    let user_point = point.total_point;
                                                    user_point = user_point - req.body.point;
                                                    if (user_point < 0) {
                                                        let msg = {
                                                            "status": "fail",
                                                            "code" : "E002",
                                                            "msg" : "거래금액이 구매자의 보유 금액보다 클 수 없습니다."
                                                        };
                                                        bitwebResponse.code = 200;
                                                        bitwebResponse.data = msg;
                                                        res.status(200).send(bitwebResponse.create());
                                                        return;
                                                    } else {
                                                        let data = {
                                                            "roomToken":util.makeToken(),
                                                            "buyer_id": fromUserTag,
                                                            "seller_id": targetUserTag,
                                                            "cmod": "deal",
                                                            "country":dbconfig.country,
                                                            "item": item
                                                        }
                                                        controllerVtrs.createVtrTemp(data)
                                                            .then((vtrTemp) => {
                                                                item['vtrTempId'] = vtrTemp._doc._id;                                                                
                                                                if(item._doc.category == "game") {
                                                                    req.body['buyer_game_character'] = req.body.buyer_game_character;
                                                                    item['target_game_character'] = req.body.target_game_character;
                                                                }
                                                                controllerTradePoints.createByTradePoint(country, req.body)
                                                                    .then(result => {       
                                                                        item['tradePointId'] = result._doc._id;
                                                                        controllerItems.updateById(country, itemId, item)
                                                                            .then(data => {                        
                                                                                let point_json = {"total_point": user_point}
                                                                                controllerPoints.updateTotalPoint(country, pointId, point_json)
                                                                                    .then(() => {
                                                                                        let body3 = {
                                                                                            "type": "deposit",
                                                                                            "itemId": result._doc.item._id,
                                                                                            "pointTrade": result,
                                                                                            "point": req.body.point,
                                                                                            "reqUser":user._doc._id,
                                                                                            "regDate": util.formatDate(new Date().toString())
                                                                                        };

                                                                                        controllerVtrs.createEscrow(country, body3)
                                                                                            .then(() => {
                                                                                                //sms 전송
                                                                                                smsController.sendBuynow(country, fromUserTag, targetUserTag)
                                                                                                .then(() => {
                                                                                                    result._doc['result'] = "success";
                                                                                                    bitwebResponse.code = 200;
                                                                                                    bitwebResponse.data = result;
                                                                                                    res.status(200).send(bitwebResponse.create())
                                                                                                });
                                                                                            }).catch((err) => {
                                                                                            console.error('err=>', err)
                                                                                            bitwebResponse.code = 500;
                                                                                            bitwebResponse.message = err;
                                                                                            res.status(500).send(bitwebResponse.create())
                                                                                        })
                                                                                    }).catch((err) => {
                                                                                    console.error('err=>', err)
                                                                                    bitwebResponse.code = 500;
                                                                                    bitwebResponse.message = err;
                                                                                    res.status(500).send(bitwebResponse.create())
                                                                                })
                                                                            }).catch((err) => {
                                                                            console.error('err=>', err)
                                                                            bitwebResponse.code = 500;
                                                                            bitwebResponse.message = err;
                                                                            res.status(500).send(bitwebResponse.create())
                                                                        })
                                                                    }).catch((err) => {
                                                                    console.error('err=>', err)
                                                                    bitwebResponse.code = 500;
                                                                    bitwebResponse.message = err;
                                                                    res.status(500).send(bitwebResponse.create())
                                                                })
                                                            }).catch((err) => {
                                                            console.error('err=>', err)
                                                            bitwebResponse.code = 500;
                                                            bitwebResponse.message = err;
                                                            res.status(500).send(bitwebResponse.create())
                                                        })
                                                    }
                                                }).catch((err) => {
                                                console.error('err=>', err)
                                                bitwebResponse.code = 500;
                                                bitwebResponse.message = err;
                                                res.status(500).send(bitwebResponse.create())
                                            })
                                        }).catch((err) => {
                                        console.error('err=>', err)
                                        bitwebResponse.code = 500;
                                        bitwebResponse.message = err;
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
                                    return;
                                }
                            }).catch((err) => {
                            console.error('err=>', err)
                            bitwebResponse.code = 500;
                            bitwebResponse.message = err;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                    console.error('err=>', err)
                    bitwebResponse.code = 500;
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create())
                })
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})

router.get('/item/:itemId', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    let itemId = req.params.itemId;
    let country = dbconfig.country;

    controllerTradePoints.getByItemId(country, itemId)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.delete('/cancel/:itemId/:userId', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let itemId = req.params.itemId;
    let userId = req.params.userId;
    let country = dbconfig.country;

    controllerTradePoints.deleteByItemId(country, itemId, userId)
        .then((result) => {
            let data = {}
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.put('/:tradePointId/trade/:tradeType', function (req, res, next) {

    // "vtrId": "5bc9a10c8f8b950ffe068dfa"
    let sampleJson =
        {
            "status": true
        }

    var bitwebResponse = new BitwebResponse();
    if (req.params.tradePointId != null) {

        controllerTradePoints.updateStatus(req)
            .then((result) => {
                let data = {}
                bitwebResponse.code = 200;
                bitwebResponse.data = result;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})


router.delete('/:tradePointId/:tradeType', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    if (req.params.tradePointId != null) {
        controllerTradePoints.remove(req)
            .then(result => {
                bitwebResponse.code = 200;
                bitwebResponse.data = result;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})

module.exports = router;
