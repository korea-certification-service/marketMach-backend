var express = require('express');
var router = express.Router();
var controllerVtrs = require('../controllers/vtrs')
var controllerItems = require('../controllers/items')
var controllerCoins = require('../controllers/coins')
var BitwebResponse = require('../utils/BitwebResponse')
var dbconfig = require('../config/dbconfig');
const smsController = require('../controllers/sms')
var util = require('../utils/util')
var request = require('request');

router.get('/:userId', function (req, res, next) {
    let country = dbconfig.country;
    let mongoose = require('mongoose');
    let Schema = mongoose.Schema;

    let body = {
        $or : [{"from_user": Schema.Types.ObjectId(req.params.userId)},{"to_user": Schema.Types.ObjectId(req.params.userId)}]
    };

    var bitwebResponse = new BitwebResponse();

    controllerVtrs.getVtrs(country, body)
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

router.get('/:vtrId', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();

    controllerVtrs.get(req)
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

router.get('/item/:itemId', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    let itemId = req.params.itemId;
    let country = dbconfig.country;

    controllerVtrs.getByItemId(country, itemId)
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

router.get('/count/user/:userId', function (req, res, next) {
    let userId = req.params.userId;
    let country = dbconfig.country;
    let option = {
        $or: [{"from_userId": userId}, {"to_userId": userId}],
        "completed": { $exists: false }
    }
    
    var bitwebResponse = new BitwebResponse();
    controllerVtrs.getItemsByUserId(country, userId, option)
        .then(vtrs => {
            let count_data = {
                "game_buy": 0,
                "game_sell": 0,
                "etc_buy": 0,
                "etc_sell": 0,
                "otc_buy": 0,
                "otc_sell": 0
            }
            for (var i in vtrs) {
                if(vtrs[i]._doc.from_userId == userId) {
                    if(vtrs[i]._doc.item.category == "game") {
                        count_data.game_sell++;
                    } if(vtrs[i]._doc.item.category == "otc") {
                        count_data.otc_sell++;
                    } else {
                        count_data.etc_sell++;
                    }
                } else {
                    if(vtrs[i]._doc.item.category == "game") {
                        count_data.game_buy++;
                    } if(vtrs[i]._doc.item.category == "otc") {
                        count_data.otc_buy++;
                    } else {
                        count_data.etc_buy++;
                    }
                }
            }

            bitwebResponse.code = 200;
            bitwebResponse.data = count_data;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.get('/user/:userId/:trade_type', function (req, res, next) {
    let pageIdx = req.query.pageIdx;
    let perPage = req.query.perPage;
    let userId = req.params.userId;
    let country = dbconfig.country;
    let category = req.query.category;
    let trade_type = req.params.trade_type;
    let status = req.query.status;
    if(status == 4) {
        status = [4,5,6,7];
    }
    let item_title = req.query.item_title;

    // let option = {
    //     $or: [{"from_userId": userId}, {"to_userId": userId}]
    // };

    let option = {"to_userId": userId}; 
    if(trade_type == "sell") {
        option = {"from_userId": userId};
    }
    
    var bitwebResponse = new BitwebResponse();
    controllerVtrs.getItemsByUserId(country, userId, option)
        .then(vtrs => {
            let itemIds = [];
            let userTag = req.session.userTag;
            for (var i in vtrs) {
                itemIds.push(vtrs[i].item._id);
            }
            
            console.log("itemIds : ", itemIds);
            var controllerItems = require('../controllers/items')

            let option2 = {
                pageIdx: 0,
                perPage: 20
            }

            if (pageIdx != undefined) option2['pageIdx'] = parseInt(pageIdx);
            if (perPage != undefined) option2['perPage'] = parseInt(perPage);
            
            let params = {
                $or: [
                    {$and: [
                        {"_id": {$in: itemIds}},
                        {"trade_type": { $regex: '', $options: 'i' }},
                        {"category": { $regex: category, $options: 'i' }},
                    ]},
                    {$and: [
                        { "userTag": userTag },
                        {"trade_type": { $regex: trade_type, $options: 'i' }},
                        {"category": { $regex: category, $options: 'i' }},
                    ]}
                 ]
            }

            if (status != undefined) {
                params['$or'][0]['$and'].push({'status': status});
                params['$or'][1]['$and'].push({'status': status});
            }
            if (item_title != undefined) {
                params['$or'][0]['$and'].push({'title':{$regex: item_title, $options: 'i' }});
                params['$or'][1]['$and'].push({'title':{$regex: item_title, $options: 'i' }});
            }


            controllerItems.getItemsCountByIds(country, params) 
                .then(count => {
                    controllerItems.getItemsByIds(country, params, option2)
                        .then(list => {
                            let result = {
                                "count": count,
                                "list": list
                            }
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
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.get('/cancel/:userId', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let pageIdx = req.query.pageIdx;
    let perPage = req.query.perPage;
    let userId = req.params.userId;
    let country = dbconfig.country;
    let item_title = req.query.item_title;
    let category = req.query.category;
    if(category == undefined) category = "";

    let params = {
        $and: [
            {"item.category": { $regex: category, $options: 'i' }},
            {$or: [{from_userId: userId}, {to_userId: userId}]}
        ]
    };

    if (item_title != undefined) {
        params['$and'].push({'item.title':{$regex: item_title, $options: 'i' }});
    }

    let option = {
        pageIdx: 0,
        perPage: 20
    }

    if (pageIdx != undefined) option['pageIdx'] = parseInt(pageIdx);
    if (perPage != undefined) option['perPage'] = parseInt(perPage);
    
    controllerVtrs.getCountCancels(country, params)
        .then(count => {
            controllerVtrs.getCancels(country, params, option)
                .then(cancels => {
                    let result = {
                        count: count,
                        list: cancels
                    };
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
});

router.get('/user/:userTag', function (req, res, next) {
    let pageIdx = req.query.pageIdx;
    let perPage = req.query.perPage;
    let userId = req.params.userTag;
    let country = dbconfig.country;

    let data = {};
    data['userId'] = userId;
    data['country'] = country;
    if (pageIdx != undefined) data['pageIdx'] = parseInt(pageIdx);
    if (perPage != undefined) data['perPage'] = parseInt(perPage);

    var bitwebResponse = new BitwebResponse();
    controllerVtrs.getItemIdsByUserTag(data)
        .then(vtrs => {
            let items = [];
            for (var i in vtrs) {
                items.push(vtrs[i].item);
            }
            bitwebResponse.code = 200;
            bitwebResponse.data = items;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.post('/', function (req, res, next) {

    //from_userId = 5bd29ff159ceaf6c52424fef
    //to_userId = 5bd2a05459ceaf6c52424ff0
    //itemId = 5bd2a0c6ab4cf21524d6f734
    let sampleJson =
        {
            "itemId": "1234",
            "from_userId": "1234",
            "to_userId": "5678",
            "mach": 1000
        }

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
                item._doc.status = 1;
                req.body['item'] = item;

                controllerVtrs.create(req)
                    .then(result => {

                        controllerItems.updateById(country, itemId, item)
                            .then(data => {
                                bitwebResponse.code = 200;
                                bitwebResponse.data = result;
                                res.status(200).send(bitwebResponse.create())
                            })
                    }).catch((err) => {
                    console.error('err=>', err)
                    bitwebResponse.code = 500;
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create())
                })
            })
    }
});

router.post('/chatbot/', function (req, res, next) {

    //from_userId = 5bd29ff159ceaf6c52424fef
    //to_userId = 5bd2a05459ceaf6c52424ff0
    //itemId = 5bd2a0c6ab4cf21524d6f734
    let sampleJson =
        {
            "itemId": "1234",
            "from_userId": "1234",
            "to_userId": "5678",
            "mach": 1000,
            "country": "KR"
        }

    if (req.body.itemId != null
        && req.body.from_userId != null
        && req.body.to_userId != null) {

        let data = {}
        let itemId = req.body.itemId;
        let country = req.body.country;

        var bitwebResponse = new BitwebResponse();
        let controllerItems = require('../controllers/items');

        controllerItems.getByItemId(country, itemId, "", "")
            .then(item => {
                delete req.body['itemId'];
                item._doc.status = 1;
                req.body['item'] = item;

                if(item.price != req.body.mach) {
                    item._doc.price = req.body.mach;
                    item._doc.total_price = req.body.mach;
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
                        if (item._doc.category == "game") {
                            if (item._doc.trade_type == "buy") {
                                req.body['buyer_game_character'] = item._doc.game_character;
                                req.body['seller_game_character'] = item._doc.target_game_character;
                            } else {
                                req.body['buyer_game_character'] = item._doc.target_game_character;
                                req.body['seller_game_character'] = item._doc.game_character;
                            }
                        }

                        controllerVtrs.getByItemId(country, itemId) 
                            .then(vtr => {
                                if(vtr == null) {
                                    controllerVtrs.create(req)
                                        .then(result => {

                                            controllerItems.updateById(country, itemId, item)
                                                .then(data => {
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
});

router.post('/buynow', function (req, res, next) {
    //sell인 경우에만 동작
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
                item._doc.status = 2;
                req.body['item'] = item;

                if(item.price != req.body.mach) {
                    item._doc.price = req.body.mach;
                    item._doc.total_price = req.body.mach;
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

                        controllerVtrs.getByItemId(country, itemId) 
                            .then(vtr => {
                                if(vtr == null) {
                                    controllerUser.getById(country, req.body.to_userId)
                                        .then(user => {
                                            let coinId = user._doc.coinId;
                                            controllerCoins.getByCoinId(country, coinId)
                                                .then(coin => {
                                                    let user_mach = coin.total_mach;
                                                    let user_output_mach = (coin._doc.output_total_mach == undefined ? 0 : coin._doc.output_total_mach);
                                                    if(user_mach >= user_output_mach) {
                                                        user_output_mach = (user_output_mach - req.body.mach < 0 ? 0 : user_output_mach - req.body.mach);
                                                    }
                                                    user_mach = user_mach - req.body.mach;
                                                    if (user_mach < 0) {
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
                                                                controllerVtrs.create(req)
                                                                    .then(result => {       
                                                                        controllerItems.updateById(country, itemId, item)
                                                                            .then(data => {                        
                                                                                let mach_json = {"total_mach": user_mach, "output_total_mach": user_output_mach};
                                                                                controllerCoins.updateTotalCoin(country, coinId, mach_json)
                                                                                    .then(() => {
                                                                                        let body3 = {
                                                                                            "type": "deposit",
                                                                                            "itemId": result._doc.item._id,
                                                                                            "vtr": result,
                                                                                            "mach": req.body.mach,
                                                                                            "reqUser":user._doc._id,
                                                                                            "regDate": util.formatDate(new Date().toString())
                                                                                        };

                                                                                        controllerVtrs.createEscrow(country, body3)
                                                                                            .then(() => {
                                                                                                //sms 전송
                                                                                                smsController.sendBuynow(country, fromUserTag, targetUserTag)
                                                                                                .then(() => {
                                                                                                    //바로구매 후 페르소나에 동기와 요청
                                                                                                    let seller_userTag = req.params.userTag;
                                                                                                    if(result._doc.item.trade_type == 'sell') {
                                                                                                        seller_userTag = result._doc.item.userTag;
                                                                                                    }
                                                                                                    let url = dbconfig.chatbot_base_url + 'api/v1/vtrs/trade/buynow';

                                                                                                    let param = {
                                                                                                        "country": dbconfig.country,
                                                                                                        "vtr_id": result._doc._id.toString(), 
                                                                                                        "mach": req.body.mach,
                                                                                                        "itemId": result._doc.item._id.toString(),
                                                                                                        "from_userId": fromUserTag,
                                                                                                        "to_userId": targetUserTag
                                                                                                    };

                                                                                                    let header = {
                                                                                                        'Content-Type': 'application/json'
                                                                                                    };

                                                                                                    console.log(param);

                                                                                                    request({uri: url, 
                                                                                                        method:'POST',
                                                                                                        form: param,
                                                                                                        headers: header}, function (error, response, body) {
                                                                                                        if (!error && response.statusCode == 200) {
                                                                                                            console.log('success : ', body);
                                                                                                        } else {
                                                                                                            console.log('error = ' + error);
                                                                                                        }
                                                                                                    });

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

router.put('/:itemId/trade/:tradeType', function (req, res, next) {

    // "vtrId": "5bc9a10c8f8b950ffe068dfa"
    let sampleJson =
        {
            "status": true
        }

    var bitwebResponse = new BitwebResponse();
    
    let country = dbconfig.country;
        controllerVtrs.updateStatusByItemId(country, req)
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
})

router.put('/chatbot/:vtrId/trade/:tradeType', function (req, res, next) {

    // "vtrId": "5bc9a10c8f8b950ffe068dfa"
    let sampleJson =
        {
            "country": "KR",
            "status": true
        }

    var bitwebResponse = new BitwebResponse();
    if (req.params.vtrId != null) {
        let country = req.body.country;
        controllerVtrs.updateStatus(country, req)
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


router.delete('/:vtrId', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    if (req.params.vtrId != null) {
        controllerVtrs.remove(req)
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

router.delete('/chatbot/:country/:itemId', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = req.params.country;
    let itemId = req.params.itemId;
    let body = {"status": 0, "roomToken": ""};

    if (req.params.itemId != null) {
        controllerItems.updateById(country, itemId, body)
            .then(() => {
                controllerVtrs.getTempByItemId(country, itemId)
                    .then((vtrTemp) => {
                        if(vtrTemp != null) {
                            req.params.vtrTempId = vtrTemp._doc._id;
                            controllerVtrs.removeVtrTemp(req)
                                .then((result) => {
                                    controllerVtrs.getByItemId(country, itemId)
                                        .then((vtr) => {
                                            if (vtr == null) {
                                                bitwebResponse.code = 200;
                                                bitwebResponse.data = result;
                                                res.status(200).send(bitwebResponse.create())
                                            } else {
                                                req.params.vtrId = vtr._doc._id;
                                                controllerVtrs.remove(req)
                                                    .then((result) => {
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
                                }).catch((err) => {
                                console.error('err=>', err)
                                bitwebResponse.code = 500;
                                bitwebResponse.message = err;
                                res.status(500).send(bitwebResponse.create())
                            })
                        } else {
                            bitwebResponse.code = 200;
                            bitwebResponse.data = "no delete data.";
                            res.status(200).send(bitwebResponse.create())
                        }
                    })
            })
    }
})

router.delete('/chatbot/cancel/:vtrId/:userId', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let vtrId = req.params.vtrId;
    let userId = req.params.userId;
    let country = dbconfig.country;

    controllerVtrs.deleteVtrs(country, vtrId, userId)
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

router.delete('/cancel/:itemId/:userId', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let itemId = req.params.itemId;
    let userId = req.params.userId;
    let country = dbconfig.country;

    controllerVtrs.deleteVtrsByItemId(country, itemId, userId)
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

router.put('/opposition/:itemId', function (req, res, next) {
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    var bitwebResponse = new BitwebResponse();

    controllerVtrs.opposition(country, itemId)
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
    });
});


module.exports = router;
