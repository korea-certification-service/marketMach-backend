var express = require('express');
var router = express.Router();
const bitcore = require('bitcore-lib');
const request = require('request');
const Address = require('bitcore-explorers/node_modules/bitcore-lib/lib/address');
const ripemd160 = require('ripemd160');
const bitcoin = require('bitcoinjs-lib');
const dbconfig = require('../config/dbconfig');
const util = require('../utils/util')
const validation = require('../utils/validation')
var controllerUsers = require('../controllers/users')
var BitwebResponse = require('../utils/BitwebResponse')
var controllerCoins = require('../controllers/coins');
var controllerAgreements = require('../controllers/agreements');
var controllerPoints = require('../controllers/points');
var controllerCoinHistorys = require('../controllers/coinHistorys');
var CryptoJS = require("crypto-js");
var md5 = require('md5');
let networks = dbconfig.testnet.network == "testnet" ? bitcore.Networks.testnet : bitcore.Networks.mainnet;

router.get('/:userId', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    if (req.params.userId != null) {
        controllerUsers.get(req)
            .then(result => {

                delete result._doc.password;
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

router.get('/info/:userTag', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    if (req.params.userTag != null) {
        let country = dbconfig.country;
        let userTag = req.params.userTag;

        controllerUsers.getByUserTag(country, userTag)
            .then(result => {

                delete result._doc.password;
                if (result._doc.phone == undefined) {
                    result._doc['phone_validity'] = false;
                } else {
                    if(result._doc.phone == "") {
                        result._doc['phone_validity'] = false;
                    } else {
                        result._doc['phone_validity'] = true;
                    }
                }
                delete result._doc.phone;

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

router.get('/info/:userTag/:loginToken', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    if (req.params.userTag != null) {
        let country = dbconfig.country;
        let userTag = req.params.userTag;
        let loginToken = req.params.loginToken;

        controllerUsers.getByUserTagAndLoginToken(country, userTag, loginToken)
            .then(result => {
                if(result != null) {
                    delete result._doc.password;
                    if (result._doc.phone == undefined) {
                        result._doc['phone_validity'] = false;
                    } else {
                        if(result._doc.phone == "") {
                            result._doc['phone_validity'] = false;
                        } else {
                            result._doc['phone_validity'] = true;
                        }
                    }
                    delete result._doc.phone;
                    result._doc['login_validity'] = true;
                } else {
                    result = {};
                    result['login_validity'] = false;
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
    }

});

router.get('/userTag/:userTag', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();

    if (req.params.userTag != null) {

        let country = req.session.country;
        let userTag = req.params.userTag;
        controllerUsers.getByUserTag(country, userTag)
            .then(result => {

                if (result != null) {
                    let error = "해당 id는 이미 사용중입니다."
                    bitwebResponse.code = 403;
                    bitwebResponse.message = error;
                    res.status(403).send(bitwebResponse.create())
                } else {
                    bitwebResponse.code = 200;
                    bitwebResponse.data = "ok";
                    res.status(200).send(bitwebResponse.create())
                }

            }).catch((err) => {
            // console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
});

router.get('/email/:email', function (req, res, next) {
    // res.send('respond with a resource');

    var bitwebResponse = new BitwebResponse();
    if (req.params.email != null) {

        let country = req.session.country;
        let email = req.params.email;
        controllerUsers.getByUserEmail(country, email)
            .then(result => {
                if (result != null) {
                    let error = "해당 email은 이미 사용중입니다."
                    bitwebResponse.code = 403;
                    bitwebResponse.message = error;
                    res.status(403).send(bitwebResponse.create())
                } else {
                    bitwebResponse.code = 200;
                    bitwebResponse.data = "ok";
                    res.status(200).send(bitwebResponse.create())
                }
            }).catch((err) => {
            // console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
});

router.post('/bank/validation', function(req,res,next) {
    let tokenParam = {
        "client_id" : dbconfig.openPlatformTestnet.client_id,
        "client_secret": dbconfig.openPlatformTestnet.client_secret,
        "scope": dbconfig.openPlatformTestnet.scope,
        "grant_type": dbconfig.openPlatformTestnet.grant_type
    };

    let tokenHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    let validationParam = {
        "bank_code_std": req.body.bankAccountType,
        "account_num": req.body.bankAccount,
        "account_holder_info_type": " ",
        "account_holder_info": req.body.birthday,
        "tran_dtime": util.formatDate2(new Date())
    }

    var bitwebResponse = new BitwebResponse();
    let bank_url = dbconfig.openPlatformTestnet.url;
    let tokenUrl = bank_url + '/oauth/2.0/token';
    let validationUrl = bank_url + '/v1.0/inquiry/real_name';
    request({uri: tokenUrl, method:'POST', form: tokenParam, headers: tokenHeaders}, function(err1,res1,result1) {
        let tmpResult = JSON.parse(result1);
        if(tmpResult.rsp_code == undefined) {
            console.log(result1);
            let validationHeaders = {
                "Authorization" : "Bearer " + tmpResult.access_token,
                'Content-Type': 'application/json'
            }

            request({uri: validationUrl, method:'POST', form: JSON.stringify(validationParam), headers: validationHeaders}, function(err2,res2,result2) {
                let tmpResult1 = JSON.parse(result2);
                if(tmpResult1.rsp_code == "A0000") {
                    bitwebResponse.code = 200;
                    bitwebResponse.data = JSON.parse(result2);
                    res.status(200).send(bitwebResponse.create())
                } else {
                    console.log('error :' , JSON.parse(result2));
                    bitwebResponse.code = 500;
                    bitwebResponse.message = result2;
                    res.status(500).send(bitwebResponse.create())
                }
            });
        } else {
            console.log('error :' , JSON.parse(result1));
            bitwebResponse.code = 500;
            bitwebResponse.message = result1;
            res.status(500).send(bitwebResponse.create())
        }
    });

})

router.post('/', function (req, res, next) {

    let sampleJson =
        {
            "userTag": "kay",
            "password": "123",
            "email": "test@diablab.com",
            "phone": "010-123-4567",
            "agreements": {
                "use": true,
                "teenager": true,
                "privacy": true
            }
        }

    var bitwebResponse = new BitwebResponse();
    if (req.body.userTag != null) {

        let controllerCoins = require('../controllers/coins');
        let controllerAgreements = require('../controllers/agreements');
        let controllerPoints = require('../controllers/points');

        let country = dbconfig.country;
        req.body['country'] = country;
        let coins = req.body.coins;
        let agreements = req.body.agreements;
        let points = req.body.points;

        //total_point 컬럼 생성
        if(points == undefined) points = {"total_point": 0};

        controllerUsers.getByUserTagAndEmail(country, req.body.userTag, req.body.email)
            .then(result=> {

                if (result != null) {
                    let error = "userTag 혹은 userEmail에 이미 사용중입니다."
                    bitwebResponse.code = 403;
                    bitwebResponse.message = error;
                    res.status(403).send(bitwebResponse.create())
                } else {
                    controllerUsers.getWithdrawByPhone(country, req.body.phone)
                    .then(withdrawUser => {
                        if(withdrawUser != null) {
                            if(withdrawUser.length > 0) {
                                coins['total_mach'] = 0;
                            }
                        }
                        
                        controllerCoins.createByCoin(country, coins)
                        .then(result => {
                            if (result._id != null) {
                                let coinId = result._id;
                                console.log('coinId=>', coinId)
                                controllerAgreements.createByAgreement(country, agreements)
                                    .then(agreement => {
                                        if (agreement._id != null) {
                                            let agreementId = agreement._id;
                                            controllerPoints.createByPoint(country, points)
                                                .then(result => {
                                                    if (result._id != null) {
                                                        let pointId = result._id;
                                                        controllerUsers.createWithIds(req, coinId, agreementId, pointId)
                                                            .then(result => {

                                                                if(dbconfig.bonus.signup > 0) {
                                                                    let data10 = {
                                                                        "extType":"mach",
                                                                        "coinId": coinId,
                                                                        "category": "event-signup",          
                                                                        "status": "success",
                                                                        "currencyCode": "MACH",
                                                                        "amount": dbconfig.bonus.signup,
                                                                        "mach": dbconfig.bonus.signup,
                                                                        "regDate": util.formatDate(new Date().toString())  
                                                                    }
                                                
                                                                    controllerCoinHistorys.createCoinHistoryExtByCoinId(country, data10);
                                                                }

                                                                req.session.userTag = result.userTag;
                                                                req.session.userId = result._id;
                                                                req.session.active = true;
                                                                req.session.country = dbconfig.country;
                                                                req.session.teenager = agreement.teenager;
                                                                req.session.authPhone = agreement.authPhone;
                                                                req.session.coinId = result._doc.coinId;
                                                                req.session.pointId = result._doc.pointId;
                                                                
                                                                if(req.body.recommander != undefined) {
                                                                    controllerUsers.getRecommanderCount(country,req.body.recommander)
                                                                        .then(recommander => {
                                                                            if(recommander >= dbconfig.limitation.recommander) {
                                                                                if(req.session.tid != undefined) {
                                                                                    let sign = md5(req.session.tid + dbconfig.addpopcon.campainKey);
                                                                                    let url = dbconfig.addpopcon.url + '?tid=' + req.session.tid + '&sign=' + sign;
                                                                                    request({uri: url, 
                                                                                        method:'GET'}, function (error, response, body) {
                                                                                        if (!error && response.statusCode == 200) {
                                                                                            bitwebResponse.code = 200;
                                                                                            bitwebResponse.data = result;
                                                                                            res.status(200).send(bitwebResponse.create())
                                                                                        } else {
                                                                                            console.error('err=>', error)
                                                                                            bitwebResponse.code = 200;
                                                                                            bitwebResponse.message = error;
                                                                                            res.status(200).send(bitwebResponse.create())
                                                                                        }
                                                                                    });
                                                                                } else {
                                                                                    bitwebResponse.code = 200;
                                                                                    bitwebResponse.data = result;
                                                                                    res.status(200).send(bitwebResponse.create())
                                                                                }
                                                                            } else {
                                                                                controllerUsers.getByUserTag(country, req.body.recommander)
                                                                                    .then(user => {
                                                                                        controllerCoins.getByCoinId(country, user._doc.coinId)
                                                                                            .then(coin => {
                                                                                                let data = {"total_mach" : coin._doc.total_mach + dbconfig.bonus.recommander};
                                                                                                controllerCoins.updateById(country, user._doc.coinId, data)
                                                                                                    .then(() => {
                                                                                                        if(dbconfig.bonus.recommander > 0) {
                                                                                                            let data10 = {
                                                                                                                "extType":"mach",
                                                                                                                "coinId": user._doc.coinId,
                                                                                                                "category": "event-recommander",          
                                                                                                                "status": "success",
                                                                                                                "currencyCode": "MACH",
                                                                                                                "amount": dbconfig.bonus.recommander,
                                                                                                                "mach": dbconfig.bonus.recommander,
                                                                                                                "regDate": util.formatDate(new Date().toString())  
                                                                                                            }
                                                                                        
                                                                                                            controllerCoinHistorys.createCoinHistoryExtByCoinId(country, data10);
                                                                                                        }

                                                                                                        if(req.session.tid != undefined) {
                                                                                                            let sign = md5(req.session.tid + dbconfig.addpopcon.campainKey);
                                                                                                            let url = dbconfig.addpopcon.url + '?tid=' + req.session.tid + '&sign=' + sign;
                                                                                                            request({uri: url, 
                                                                                                                method:'GET'}, function (error, response, body) {
                                                                                                                if (!error && response.statusCode == 200) {
                                                                                                                    bitwebResponse.code = 200;
                                                                                                                    bitwebResponse.data = result;
                                                                                                                    res.status(200).send(bitwebResponse.create())
                                                                                                                } else {
                                                                                                                    console.error('err=>', error)
                                                                                                                    bitwebResponse.code = 200;
                                                                                                                    bitwebResponse.message = error;
                                                                                                                    res.status(200).send(bitwebResponse.create())
                                                                                                                }
                                                                                                            });
                                                                                                        } else {
                                                                                                            bitwebResponse.code = 200;
                                                                                                            bitwebResponse.data = result;
                                                                                                            res.status(200).send(bitwebResponse.create())
                                                                                                        }
                                                                                                    }).catch((err) => {
                                                                                                    // console.error('err=>', err)
                                                                                                    bitwebResponse.code = 500;
                                                                                                    bitwebResponse.message = err;
                                                                                                    res.status(500).send(bitwebResponse.create())
                                                                                                })
                                                                                            })
                                                                                    }).catch((err) => {
                                                                                    // console.error('err=>', err)
                                                                                    bitwebResponse.code = 500;
                                                                                    bitwebResponse.message = err;
                                                                                    res.status(500).send(bitwebResponse.create())
                                                                                })
                                                                            }
                                                                        }).catch((err) => {
                                                                        // console.error('err=>', err)
                                                                        bitwebResponse.code = 500;
                                                                        bitwebResponse.message = err;
                                                                        res.status(500).send(bitwebResponse.create())
                                                                    })
                                                                } else {
                                                                    if(req.session.tid != undefined) {
                                                                        let sign = md5(req.session.tid + dbconfig.addpopcon.campainKey);
                                                                        let url = dbconfig.addpopcon.url + '?tid=' + req.session.tid + '&sign=' + sign;
                                                                        request({uri: url, 
                                                                            method:'GET'}, function (error, response, body) {
                                                                            if (!error && response.statusCode == 200) {
                                                                                bitwebResponse.code = 200;
                                                                                bitwebResponse.data = result;
                                                                                res.status(200).send(bitwebResponse.create())
                                                                            } else {
                                                                                console.error('err=>', error)
                                                                                bitwebResponse.code = 200;
                                                                                bitwebResponse.message = error;
                                                                                res.status(200).send(bitwebResponse.create())
                                                                            }
                                                                        });
                                                                    } else {
                                                                        bitwebResponse.code = 200;
                                                                        bitwebResponse.data = result;
                                                                        res.status(200).send(bitwebResponse.create())
                                                                    }
                                                                }
                                                            }).catch((err) => {
                                                                // console.error('err=>', err)
                                                                bitwebResponse.code = 500;
                                                                bitwebResponse.message = err;
                                                                res.status(500).send(bitwebResponse.create())
                                                            })
                                                    }
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
                    });
                }

            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})

router.post('/login', function (req, res, next) {
    if (req.body.userTag != null && req.body.password != null) {

        let country = dbconfig.country;
        let userTag = req.body.userTag;
        let remember = req.body.remember;
        let crypto = require('crypto');
        let password = crypto.createHash('sha256').update(req.body.password).digest('base64');
        let data = {}

        data['userTag'] = userTag;
        data['password'] = password;
        console.log('data=>', data)

        var bitwebResponse = new BitwebResponse();
        controllerUsers.getUser(country, data)
            .then(result => {
                let loginToken = util.makeToken();
                let data1 = {};
                data1['loginToken'] = loginToken;
                controllerUsers.updateLoginToken(country, result._doc._id, data1)
                    .then(() => {
                        controllerAgreements.getById(country, result._doc.agreementId.toString())
                            .then((agreement) => {
                                req.session.userTag = result.userTag;
                                req.session.userId = result._id;
                                req.session.userName = result.userName;
                                req.session.coinId = result.coinId;
                                req.session.pointId = result.pointId;
                                req.session.active = result.active;
                                req.session.country = dbconfig.country;
                                req.session.teenager = agreement.teenager;
                                req.session.authPhone = agreement.authPhone;
                                req.session.bitberry_token = result.bitberry_token;

                                // chatbot에서 로그인 확인을 위한 쿠키 생성
                                let key = CryptoJS.enc.Hex.parse("0123456789abcdef0123456789abcdef"); // key 값 > 변경가능
                                let iv =  CryptoJS.enc.Hex.parse("abcdef9876543210abcdef9876543210"); // iv 값 > 변경가능
                                let cookie_string = userTag+'|'+ loginToken; // "|" 로 구분
                                let orange__F = CryptoJS.AES.encrypt(cookie_string, key, {iv:iv}); // 쿠키명 = orange__T
                                orange__F = orange__F.ciphertext.toString(CryptoJS.enc.Base64);  //and the ciphertext put to base64
                                res.cookie("orange__F",orange__F, {
                                    domain: 'marketmach.com',
                                    expires: new Date(Date.now() + (60 * 60 * 1000)), //1시간
                                });

                                res.cookie("orange__F",orange__F, {
                                    expires: new Date(Date.now() + (60 * 60 * 1000)), //1시간
                                });

                                // if (remember) {
                                //     res.cookie("remember", remember , {
                                //         expires: new Date(Date.now() + 900000),
                                //         httpOnly: true
                                //     });
                                // } else {
                                //     remember = "false";
                                //     res.cookie("remember", remember , {
                                //         expires: new Date(Date.now() + 900000),
                                //         httpOnly: true
                                //     });
                                // }

                                let resData = {"userTag": result.userTag, "userId": result._id, "active": result.active}
                                bitwebResponse.code = 200;
                                bitwebResponse.data = resData;
                                res.status(200).send(bitwebResponse.create())
                            }).catch((err) => {
                            console.error('err=>', err)

                            let resErr = "Incorrect ID or password";
                            bitwebResponse.code = 403;
                            bitwebResponse.message = resErr;
                            res.status(403).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                    console.error('err=>', err)

                    let resErr = "처리중 에러 발생";
                    bitwebResponse.code = 500;
                    bitwebResponse.message = resErr;
                    res.status(403).send(bitwebResponse.create())
                })
            }).catch((err) => {
            console.error('err=>', err)

            let resErr = "Incorrect ID or password";
            bitwebResponse.code = 403;
            bitwebResponse.message = resErr;
            res.status(403).send(bitwebResponse.create())
        })

    }
});
router.put('/:userId', function (req, res, next) {

    let sampleJson =
        {
            "userTag": "kay2",
            "userName": "kyewon",
            "password": "123",
            "email": "test2@diablab.com",
            "active": true,
            "phone": "010-123-4567",
            "mail_auth_code": "asdf",
            "coins": {
                "mach_address": "asdf2",
                "btc_address": "qewr2",
                "ether_address": "zxcv"
            },
            "points": {
                "bank_account_type": "신한은행2",
                "bank_account": "123-5656-345-3",
                "total_point": 0
            },
            "agreements": {
                "use": true,
                "teenager": true,
                "privacy": true
            }
        }

    var bitwebResponse = new BitwebResponse();
    if (req.params.userId != null) {

        let country = req.session.country;
        let email = req.body.email;
        let coins = req.body.coins;
        let agreements = req.body.agreements;
        let points = req.body.points;

        if (coins == undefined) coins = {}
        if (agreements == undefined) agreements = {}
        if (points == undefined) points = {}

        //to-do : 거래 국가가 같으면 update, 다르면 다 조회해서 connection 재 연결 후 insert 처리 한다.
        controllerUsers.getById(country, req.params.userId)
            .then((user) => {
                controllerUsers.update(req)
                    .then((result) => {

                        let resData = result;
                        let coinId = result.coinId;
                        let agreementId = result.agreementId;
                        let pointId = result.pointId;

                        controllerCoins.updateById(country, coinId, coins)
                            .then(result => {
                                console.log('coinId=>', coinId)
                                controllerAgreements.updateById(country, agreementId, agreements)
                                    .then(result => {
                                        controllerPoints.updateById(country, pointId, points)
                                            .then(result => {
                                                resData['address'] = result.address;
                                                console.log('resData=>', resData);

                                                //if (country != undefined) req.session.country = country;
                                                //if (email != undefined) req.session.active = false;

                                                // if(country != undefined) {
                                                //     controllerUsers.getById(country, req.params.userId)
                                                //         .then((beforeUser) => {
                                                //             if (beforeUser != null) {
                                                //                 req.session.country = country;
                                                //                 req.body = beforeUser._doc;
                                                //                 controllerUsers.update(req)
                                                //                     .then((result) => {
                                                //
                                                //                         let resData = result;
                                                //                         let coinId = result.coinId;
                                                //                         let agreementId = result.agreementId;
                                                //                         let pointId = result.pointId;
                                                //
                                                //                         controllerCoins.updateById(country, coinId, coins)
                                                //                             .then(result => {
                                                //                                 console.log('coinId=>', coinId)
                                                //                                 controllerAgreements.updateById(country, agreementId, agreements)
                                                //                                     .then(result => {
                                                //                                         controllerPoints.updateById(country, pointId, points)
                                                //                                             .then(result => {
                                                //                                                 resData['address'] = result.address;
                                                //                                                 console.log('resData=>', resData);
                                                //
                                                //                                                 if (country != undefined) req.session.country = country;
                                                //                                                 if (email != undefined) req.session.active = false;
                                                //
                                                //
                                                //                                                 bitwebResponse.code = 200;
                                                //                                                 bitwebResponse.data = resData;
                                                //                                                 res.status(200).send(bitwebResponse.create())
                                                //                                             })
                                                //                                     })
                                                //                             })
                                                //                     }).catch((err) => {
                                                //                     console.error('err=>', err)
                                                //                     bitwebResponse.code = 500;
                                                //                     bitwebResponse.message = err;
                                                //                     res.status(500).send(bitwebResponse.create())
                                                //                 })
                                                //             } else {
                                                //                 controllerCoins.getByCoinId(req.session.country, user._doc.coinId)
                                                //                     .then(coin => {
                                                //                         delete coin['_doc']['_id'];
                                                //                         controllerCoins.createByCoin(country, coin._doc)
                                                //                             .then(result => {
                                                //                                 if (result._id != null) {
                                                //                                     let coinId = result._id;
                                                //                                     console.log('coinId=>', coinId)
                                                //                                     controllerAgreements.getById(req.session.country, user._doc.agreementId)
                                                //                                         .then((agreement) => {
                                                //                                             delete agreement['_doc']['_id'];
                                                //                                             controllerAgreements.createByAgreement(country, agreement._doc)
                                                //                                                 .then(result => {
                                                //                                                     if (result._id != null) {
                                                //                                                         let agreementId = result._id;
                                                //                                                         controllerPoints.getByPointId(req.session.country, user._doc.pointId)
                                                //                                                             .then((point) => {
                                                //                                                                 delete point['_doc']['_id'];
                                                //                                                                 controllerPoints.createByPoint(country, point._doc)
                                                //                                                                     .then(result => {
                                                //                                                                         if (result._id != null) {
                                                //                                                                             let pointId = result._id;
                                                //                                                                             req.session.country = country;
                                                //                                                                             controllerUsers.createWithIds2(user, country, coinId, agreementId, pointId)
                                                //                                                                                 .then(result => {
                                                //                                                                                     req.session.userId = result._id;
                                                //                                                                                     bitwebResponse.code = 200;
                                                //                                                                                     bitwebResponse.data = result;
                                                //                                                                                     res.status(200).send(bitwebResponse.create())
                                                //                                                                                 })
                                                //                                                                         }
                                                //                                                                     })
                                                //                                                             })
                                                //                                                     }
                                                //                                                 }).catch((err) => {
                                                //                                                 console.error('err=>', err)
                                                //                                                 bitwebResponse.code = 500;
                                                //                                                 bitwebResponse.message = err;
                                                //                                                 res.status(500).send(bitwebResponse.create())
                                                //                                             })
                                                //                                         })
                                                //                                 }
                                                //                             })
                                                //                     })
                                                //             }
                                                //         })
                                                // }

                                                bitwebResponse.code = 200;
                                                bitwebResponse.data = resData;
                                                res.status(200).send(bitwebResponse.create())
                                            })
                                    })
                            })
                    }).catch((err) => {
                    console.error('err=>', err)
                    bitwebResponse.code = 500;
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create())
                    })
            });


    }
})

router.put('/changePassword/:userId', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();

    controllerUsers.update(req)
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

router.delete('/:userId', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    if (req.params.userId != null) {
        controllerUsers.getById(dbconfig.country, req.params.userId)
            .then(user => {
                let withdrawUser = user._doc;
                controllerUsers.createWithdrawUser(dbconfig.country, withdrawUser)
                    .then(() => {
                        controllerUsers.remove(req)
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
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})

router.get("/btcAddress/:address", function(req, res, next){
    let address = req.params.address;
    var bitwebResponse = new BitwebResponse();
    let result;

    if (Address.isValid(address, networks))
    {
        console.log("Address isValid : True");
        result = true;

    } else {
        console.log("Address isValid : False");
        result = false;
    }

    bitwebResponse.code = 200;
    bitwebResponse.data = result;
    res.status(200).send(bitwebResponse.create())
})

router.put("/adultAgreement/:agreementId", function(req, res, next) {
    let agreementId = req.params.agreementId;
    let body = {"teenager" : 0};
    let country = dbconfig.country;
    var bitwebResponse = new BitwebResponse();

    controllerAgreements.updateByAgreement(country, agreementId, body)
        .then(agreement => {
            req.session.teenager = agreement.teenager;

            bitwebResponse.code = 200;
            bitwebResponse.data = agreement;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.post("/validation", validation.userValidate, function(req, res, next) {
    var bitwebResponse = new BitwebResponse();

    bitwebResponse.code = 200;
    bitwebResponse.data = {
        "result": true,
        "msg": "valid"
    };
    res.status(200).send(bitwebResponse.create())
});

router.post('/checkPassword', function (req, res, next) {
    let country = dbconfig.country;
    let userTag = req.body.userTag;
    let remember = req.body.remember;
    let crypto = require('crypto');
    let password = crypto.createHash('sha256').update(req.body.password).digest('base64');
    let data = {}

    data['userTag'] = userTag;
    data['password'] = password;
    console.log('data=>', data)

    var bitwebResponse = new BitwebResponse();
    controllerUsers.getUser(country, data)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data =  result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
});
        


module.exports = router;
