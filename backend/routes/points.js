const express = require('express');
const router = express.Router();
const controllerPoints = require('../controllers/points')
const controllerPointHistorys = require('../controllers/pointHistorys');
const controllerPointBankHistorys = require('../controllers/pointBankHistorys');
const BitwebResponse = require('../utils/BitwebResponse')
const util = require('../utils/util')
const request = require('request');
const dbconfig = require('../config/dbconfig');

router.get('/:pointId', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    if (req.params.pointId != null) {
        controllerPoints.get(req)
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

router.post('/', function (req, res, next) {

    let sampleJson =
        {
            "userId": "123",
            "bank_account_type": "신한은행",
            "bank_account": "123-5656-345-3",
            "total_point": 0
        }

    if (req.body.userId != null) {

        let data = {}

        var bitwebResponse = new BitwebResponse();
        controllerPoints.create(req)
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


router.put('/:pointId', function (req, res, next) {

    // "pointId": "5bc9a10c8f8b950ffe068dfa"
    let sampleJson =
        {
            "userId": "5bc9a10de399867b00e2e30f",
            "bank_account_type": "신한은행",
            "bank_account": "123-5656-345-3"
        }

    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let pointId = req.params.pointId;
    let body = req.body;

    controllerPoints.updateById(country, pointId, body)
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
})

router.put('/user/:userId', function (req, res, next) {

    // "pointId": "5bc9a10c8f8b950ffe068dfa"
    let sampleJson =
        {
            "userId": "5bc9a10de399867b00e2e30f",
            "type": "deposit",
            "imp_uid": "test",
            "point": 1000,
            "price": 1000
        }

    var bitwebResponse = new BitwebResponse();
    let country = req.session.country;
    let userId = req.params.userId;
    let controllerUsers = require('../controllers/users');

    if(req.params.userId != null) {

        controllerUsers.getById(country, userId)
            .then((user) => {
                if (user.pointId != null) {
                    let pointId = user.pointId;
                    let body = req.body;
                    controllerPoints.getByPointId(country, pointId)
                        .then((point) => {
                            body.total_point = parseInt(body.point) + point.total_point;
                            controllerPoints.updateById(country, pointId, body)
                                .then((result) => {
                                    let controllerPointBankHistory = require('../controllers/pointBankHistorys');
                                    body["regDate"] = util.formatDate(new Date().toLocaleString('ko-KR'));

                                    controllerPointBankHistory.create(req)
                                        .then((result2) => {
                                            let historyId = result2._doc._id;
                                            controllerPoints.updateWithBankHistory(country, pointId, historyId)
                                                .then(() => {
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
    }
})

router.post('/:pointId/bank', function (req, res, next) {

    let sampleJson =
        {
            "type": "deposit",
            "imp_uid": "abcd",
            "imp_apply_num": "12fad",
            "point": 100,
            "price": 200
        }

    var bitwebResponse = new BitwebResponse();
    if (req.params.pointId != null) {

        let country = req.session.country;
        let pointId = req.params.pointId;
        let body = req.body;
        body['pointId'] = pointId;
        body['status'] = false;

        controllerPointBankHistorys.createPointBankHistoryByPointBankId(country, pointId, body)
            .then((result) => {

                let historyId = result._id;
                controllerPoints.updateWithBankHistory(country, pointId, historyId)
                    .then((result) => {

                        let total_point = result.total_point;
                        let point = Number(req.body.point);
                        let sum_point = 0

                        if (req.body.type == "deposit") {
                            sum_point = total_point + point
                        } else if (req.body.type == "withdraw") {
                            sum_point = total_point - point;
                        }

                        let data = {
                            "total_point" : sum_point
                        }
                        controllerPoints.updateTotalPoint(country, pointId, data)
                            .then(result => {
                                if (req.body.type == "withdraw") {
                                    let tokenParam = {
                                        "client_id" : dbconfig.openPlatformTestnet.client_id,
                                        "client_secret": dbconfig.openPlatformTestnet.client_secret,
                                        "scope": dbconfig.openPlatformTestnet.scope,
                                        "grant_type": dbconfig.openPlatformTestnet.grant_type
                                    };

                                    let tokenHeaders = {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }

                                    let withdrawParam = {
                                        "wd_pass_phrase": dbconfig.openPlatformTestnet.withdraw.wd_pass_phrase,
                                        "wd_print_content": dbconfig.openPlatformTestnet.withdraw.wd_print_content,
                                        "name_check_option": dbconfig.openPlatformTestnet.withdraw.name_check_option,
                                        "req_cnt" : 1,
                                        "req_list": [{
                                            "tran_no": 1,
                                            "bank_code_std": req.body.bankAccountType,
                                            "account_num": req.body.bankAccount,
                                            "account_holder_name": req.body.userName,
                                            "print_content": '마하계좌이체',
                                            "tran_amt": req.body.price
                                        }],
                                        "tran_dtime": util.formatDate2(new Date())
                                    }

                                    var bitwebResponse = new BitwebResponse();
                                    let bank_url = dbconfig.openPlatformTestnet.url;
                                    let tokenUrl = bank_url + '/oauth/2.0/token';
                                    let validationUrl = bank_url + '/v1.0/transfer/deposit2';
                                    request({uri: tokenUrl, method:'POST', form: tokenParam, headers: tokenHeaders}, function(err1,res1,result1) {
                                        let tmpResult = JSON.parse(result1);
                                        if(tmpResult.rsp_code == undefined) {
                                            console.log(result1);
                                            let validationHeaders = {
                                                "Authorization" : "Bearer " + tmpResult.access_token,
                                                'Content-Type': 'application/json'
                                            }

                                            request({uri: validationUrl, method:'POST', form: JSON.stringify(withdrawParam), headers: validationHeaders}, function(err2,res2,result2) {
                                                let tmpResult1 = JSON.parse(result2);
                                                if(tmpResult1.rsp_code == "A0000") {
                                                    //입금 이체가 완료되면 bank history status를 true로 변경한다.
                                                    controllerPointBankHistorys.updatePointBankHistoryStatusById(country, historyId)
                                                        .then(() => {
                                                            bitwebResponse.code = 200;
                                                            bitwebResponse.data = JSON.parse(result2);
                                                            res.status(200).send(bitwebResponse.create())
                                                        })
                                                } else {
                                                    console.log('error :' , JSON.parse(result2));
                                                    bitwebResponse.code = 403;
                                                    bitwebResponse.data = JSON.parse(result2);
                                                    res.status(200).send(bitwebResponse.create())
                                                }
                                            });
                                        } else {
                                            console.log('error :' , JSON.parse(result1));
                                            bitwebResponse.code = 500;
                                            bitwebResponse.message = result1;
                                            res.status(500).send(bitwebResponse.create())
                                        }
                                    });
                                }
                            })
                    })

            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})

router.post('/:pointId/trade', function (req, res, next) {

    let sampleJson =
        {
            "point": 10,
            "trade_type": "buy",
            "from_userId": "5bc9a10de399867b00e2e30f",
            "to_userId": "456"
        }

    var bitwebResponse = new BitwebResponse();
    if (req.params.pointId != null) {

        if (req.body.point != null) {

            let country = req.session.country;
            let pointId = req.params.pointId;
            let point = req.body.point;

            controllerPointHistorys.createPointHistoryByPointId(country, pointId, req.body)
                .then(result => {
                    let historyId = result._id;

                    //TODO: test total_point => historyPoint
                    controllerPoints.updateWithHistory(country, pointId, historyId)
                        .then((result) => {
                            controllerPoints.getByPointId(country, pointId)
                                .then(result => {
                                    console.log('getPoint result=>', result);

                                    let total_point = result.total_point;
                                    console.log('total_point=>', total_point)
                                    total_point = Number(total_point) + Number(point);
                                    console.log('total_point2=>', total_point)

                                    let data = {"total_point": total_point}
                                    controllerPoints.updateTotalPoint(country, pointId, data)
                                        .then((result) => {
                                            bitwebResponse.code = 200;
                                            bitwebResponse.data = result;
                                            res.status(200).send(bitwebResponse.create())
                                        })
                                });
                        });
                }).catch((err) => {
                console.error('err=>', err)
                bitwebResponse.code = 500;
                bitwebResponse.message = err;
                res.status(500).send(bitwebResponse.create())
            });
        }
    }
});

router.delete('/:pointId', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    if (req.params.pointId != null) {
        controllerPoints.remove(req)
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

//해피 캐시 조회
router.post('/happymoney/balance', function(req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let url = dbconfig.happymoney.url + "/unipayment/hcash/balance";
    let header = {
        'hm-api-key': dbconfig.happymoney.apiKey,
        'hm-online-id': dbconfig.happymoney.onlineId,
        'Content-Type': 'application/json; charset=utf-8'
    };
    let param = {
        'onlineId': dbconfig.happymoney.onlineId,
        'authType': req.body.authType, 
        'authValue': req.body.authValue, 
        'encryptType': req.body.encryptType, 
        'payPassword': req.body.payPassword,
        'cpUserIp': dbconfig.happymoney.ip
    };

    request({uri: url, 
            method:'POST',
            headers: header,
            body: param,
            json: true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result = body;
            console.log('success : ', body);
            if (!result.success) {
                bitwebResponse.code = 200;
                bitwebResponse.data = result.error;
                res.status(200).send(bitwebResponse.create());
                return;
            }

            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        } else {
            console.log('error = ', response);
            console.log(response.statusCode, ' url = ', url, header, param);
            bitwebResponse.code = 500;
            bitwebResponse.message = error;
            res.status(500).send(bitwebResponse.create())
        }
    });
});

//해피 캐시 결제
router.post('/happymoney/payment', function(req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let url = dbconfig.happymoney.url + "/unipayment/hcash/payment";
    let header = {
        'hm-api-key': dbconfig.happymoney.apiKey,
        'hm-online-id': dbconfig.happymoney.onlineId,
        'Content-Type': 'application/json; charset=utf-8'
    };
    let param = {
        'onlineId': dbconfig.happymoney.onlineId,
        'authType': req.body.authType, 
        'authValue': req.body.authValue, 
        'encryptType': req.body.encryptType, 
        'payKey': req.body.payKey,
        'orderNo': "happymoneyDeposit" + util.formatDate2(new Date().toString()),
        'orderAmount': req.body.orderAmount,
        'orderDate': util.formatDate2(new Date().toString()),
        'cpUserIp': dbconfig.happymoney.ip
    };

    request({uri: url, 
            method:'POST',
            headers: header,
            body: param,
            json: true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result = body.result;
            console.log('success : ', result);
            
            if (!body.success) {
                bitwebResponse.code = 200;
                bitwebResponse.data = result.error;
                res.status(200).send(bitwebResponse.create());
                return;
            }

            // TO-DO : 해피캐쉬 결제 이후 DB에 저장할 것
            let country = dbconfig.country;
            let pointId = req.body.pointId;
            result['pointId'] = req.body.pointId;
            result['type'] = req.body.type;
            result['extType'] = req.body.extType;
            result['amountCurrency'] = req.body.amountCurrency;

            controllerPoints.updateHappymoneyPoint(country, pointId, result)
                .then((result1) => {
                    bitwebResponse.code = 200;
                    bitwebResponse.data = result1;
                    res.status(200).send(bitwebResponse.create())
                }).catch((err) => {
                console.error('err=>', err)
                bitwebResponse.code = 500;
                bitwebResponse.message = err;
                res.status(500).send(bitwebResponse.create())
            })
        } else {
            bitwebResponse.code = 500;
            bitwebResponse.message = error;
            res.status(500).send(bitwebResponse.create())
        }
    });
});

module.exports = router;
