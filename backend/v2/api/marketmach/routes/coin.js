var express = require('express');
var router = express.Router();
let request = require('request');
let Ont = require('ontology-ts-sdk');
let BitwebResponse = require('../../../utils/BitwebResponse')
let dbconfig = require('../../../../../config/dbconfig');
let scheduler = require('../../../utils/scheduler');
let util = require('../../../utils/util');
let token = require('../../../utils/token');
let serviceCoinHistorys = require('../../../service/coinHistorys');
let serviceCoins = require('../../../service/coins');
let serviceUsers = require('../../../service/users');
let serviceBlackList = require('../../../service/blacklist');
let serviceFeeHistorys = require('../../../service/feeHistorys');
let serviceCoinWithdraws = require('../../../service/coinwithdraw');
let logger = require('../../../utils/log');
let smsContent = require('../../../../../config/sms');
let serviceSms = require('../../../service/sms');
let occurpancyNotifications = require('../../../service/occurpancyNotification');

//ONT wallet 입금 요청 처리
router.post('/ontwallet/deposit', token.checkInternalToken, function(req, res, next) {
    var bitwebResponse = new BitwebResponse();
    
    let country = dbconfig.country;
    let userTag = req.body.userTag;
    let condition = {
        'userTag': userTag
    }
    
    serviceUsers.detail(country, condition)
        .then(async (user) => {
            let condition = {
                "extType":"ontwallet",
                "category": 'deposit',
                "status": false,
                "currencyCode": req.body.coinType,
                "fromAddress": req.body.fromAddress
            };
            let getCoinHistory = await serviceCoinHistorys.detail(country, condition);

            if(getCoinHistory == null) {
                //history add
                let amount = req.body.mach;
                let data = {
                    "fromAddress": req.body.fromAddress,
                    "extType":"ontwallet",
                    "coinId": user._doc.coinId,
                    "category": 'deposit',          
                    "status": false,
                    "currencyCode": req.body.coinType,
                    "amount": amount,
                    "price": amount,
                    "regDate": util.formatDate(new Date().toString())  
                }
                
                serviceCoinHistorys.add(country, data)
                .then(coinHistory => {
                    let jsonData = {}
                    coinHistory._doc['successYn'] = "Y";                    
                    jsonData['coinId'] = coinHistory._doc.coinId;
                    jsonData['historyId'] = coinHistory._doc._id;                    
                    jsonData['regDate'] = util.getUnixTime(coinHistory._doc.regDate);
                    jsonData['coinType'] = req.body.coinType.toLowerCase();                    
                    jsonData['price'] = amount;
                    jsonData['fromAddress'] = req.body.fromAddress;
                    scheduler.ontJob(jsonData);

                    bitwebResponse.code = 200;
                    let resData = {
                        "coinHistory": coinHistory,
                        "ontJob": "start"
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.data = coinHistory;
                    res.status(200).send(bitwebResponse.create());
                }).catch(err => {
                    bitwebResponse.code = 500;
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, err);
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create());
                });
            } else {
                //1. history에 등록 된 coinId가 내 coinId와 다르면 alert message 띄우기
                if(getCoinHistory._doc.coinId.toString() == user._doc.coinId.toString()) {
                    //2. 요청 시간이 현재 시간 기준으로 3분 이내이면 skip, 아니면 재요청
                    let startDate = new Date(getCoinHistory._doc.regDate);
                    let endDate = new Date();
                    var tmpMin = (endDate.getTime() - startDate.getTime()) / 60000;
                    if(tmpMin >= 3) {
                        let jsonData = {}
                        jsonData['coinId'] = getCoinHistory._doc.coinId;
                        jsonData['historyId'] = getCoinHistory._doc._id;                    
                        jsonData['regDate'] = util.getUnixTime(getCoinHistory._doc.regDate);
                        jsonData['coinType'] = req.body.coinType.toLowerCase();                    
                        jsonData['price'] = req.body.mach;
                        jsonData['fromAddress'] = req.body.fromAddress;
                        scheduler.ontJob(jsonData);
                    } 

                    bitwebResponse.code = 200;
                    let resData = {
                        "coinHistory": getCoinHistory,
                        "ontJob": "start"
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.data = getCoinHistory;
                    res.status(200).send(bitwebResponse.create());
                } else {
                    bitwebResponse.code = 200;
                    let resData = {
                        "successYn":"N",
                        "message":"다른 사용자가 해당 지갑으로 입금 요청이 존재합니다. 자세한 사항은 관리자에 문의하세요."
                    };
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, resData);

                    bitwebResponse.data = resData;
                    res.status(200).send(bitwebResponse.create());
                }
            }
        }).catch(err => {
        bitwebResponse.code = 500;
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create());
    });
});

//ont wallet 출금 처리
router.post('/ontwallet/withdraw', token.checkInternalToken, function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    
    serviceUsers.detail(country, {"_id": req.body.userId})
    .then(user => {
        let condition = {
            "userName": user._doc.userName,
            "birth": user._doc.birth
        }
        serviceBlackList.list(country, condition) 
        .then(blackLists => {
            if(blackLists.length == 0) {
                let coinType = req.body.coinType;
                let country = dbconfig.country;
                
                serviceCoins.detail(country, {"_id": user._doc.coinId})
                .then(coin => {
                    let total_price = coin._doc.total_ont == undefined ? 0 : coin._doc.total_ont;
                    if(coinType == "ETH") {
                        total_price = coin._doc.total_ether == undefined ? 0 : coin._doc.total_ether;
                    } else if(coinType == "BTC") {
                        total_price = coin._doc.total_btc == undefined ? 0 : coin._doc.total_btc;
                    } else if(coinType == "ONG") {
                        total_price = coin._doc.total_ong == undefined ? 0 : coin._doc.total_ong;
                    }

                    if(total_price < req.body.amount) {
                        bitwebResponse.code = 200;
                        let message = "사용자 코인이 출금금액 보다 적습니다.";
                        if(req.body.country == "EN") {
                            message = "Your coin is less than withdrawal amount.";
                        }
                        bitwebResponse.message = {
                            "code": "E001",
                            "msg": message
                        };
                        res.status(200).send(bitwebResponse.create());
                        return;
                    }

                    let amount = req.body.amount;
                    let fee_rate = parseFloat((amount * dbconfig.fee.coin.ont.withdraw).toFixed(8));
                    let transactionAmount = Math.floor(parseFloat((amount - fee_rate).toFixed(8)));
                    //각 코인별로 출금
                    if(coinType == "ETH") {
                        fee_rate = parseFloat((amount * dbconfig.fee.coin.ether.withdraw).toFixed(8));
                        transactionAmount = parseFloat((amount - fee_rate).toFixed(8));
                    } else if(coinType == "BTC") {
                        fee_rate = parseFloat((amount * dbconfig.fee.coin.btc.withdraw).toFixed(8));
                        transactionAmount = parseFloat((amount - fee_rate).toFixed(8));
                    } else if(coinType == "ONG") {
                        fee_rate = parseFloat((amount * dbconfig.fee.coin.ong.withdraw).toFixed(8));
                        amount = parseFloat((amount - fee_rate).toFixed(8)) - parseFloat((dbconfig.ontology.gasPrice * dbconfig.ontology.gasLimit) / 1e9).toFixed(2);
                        transactionAmount = parseFloat(amount * 1e9);
                    } 

                    let update_data = {
                        "total_ont": parseFloat((coin._doc.total_ont - parseFloat((amount + fee_rate).toFixed(8))).toFixed(8))
                    }
                    if(coinType == "BTC") {
                        update_data = {
                            "total_btc": parseFloat((coin._doc.total_btc - req.body.amount).toFixed(8))
                        }
                    } else if(coinType == "ETH") {
                        update_data = {
                            "total_ether":  parseFloat((coin._doc.total_ether - req.body.amount).toFixed(8))
                        }
                    } else if(coinType == "ONG") {
                        update_data = {
                            "total_ong":  parseFloat((coin._doc.total_ong - req.body.amount).toFixed(8))
                        }
                    }
                    
                    let coinWithdrawCondition = {
                        "userTag": user._doc.userTag, 
                        "cryptoCurrencyCode":coinType, 
                        "regDate": {"$gte": util.formatDatePerDay(util.formatDate(new Date().toString())), "$lte": util.formatDate(new Date().toString())}
                    }
                    serviceCoinWithdraws.count(country, coinWithdrawCondition)
                    .then(withdrawCount => {
                        coinWithdrawCondition["status"] = "success";
                        serviceCoinWithdraws.count(country, coinWithdrawCondition)
                        .then(withdrawSuccessCount => {
                            if(withdrawCount < dbconfig.ontology.withdrawreqLimit) {
                                if(withdrawSuccessCount < dbconfig.ontology.withdrawSuccessLimit) {
                                    //supppose we have an account with enough ONT and ONG
                                    //Sender's address
                                    const from = new Ont.Crypto.Address(dbconfig.ontology.address);
                                    //Receiver's address
                                    const to = new Ont.Crypto.Address(req.body.toAddress);
                                    //Asset type
                                    const assetType = coinType;
                                    //Gas price and gas limit are to compute the gas costs of the transaction.
                                    const gasPrice = dbconfig.ontology.gasPrice;
                                    const gasLimit = dbconfig.ontology.gasLimit;
                                    const payer = from;
                                    const privateKey = new Ont.Crypto.PrivateKey(dbconfig.ontology.privateKey);
                                    //Payer's address to pay for the transaction gas
                                    const tx = Ont.OntAssetTxBuilder.makeTransferTx(assetType, from, to, transactionAmount, gasPrice, gasLimit, payer);
                                    Ont.TransactionBuilder.signTransaction(tx, privateKey)
                                    const rest = new Ont.RestClient(dbconfig.ontology.restUrl);
                                    rest.sendRawTransaction(tx.serialize())
                                    .then(result => {
                                        console.log('success : ', result);                            
                                        if(result.Error == 0) {      
                                            serviceCoins.modify(country, {"_id":user._doc.coinId}, update_data)
                                            .then(u_coin => {                        
                                                let data = {
                                                    "extType": "ontwallet",
                                                    "coinId": user._doc.coinId,
                                                    "category": "withdraw",          
                                                    "status": 'success',
                                                    "currencyCode": coinType,
                                                    "amount": amount,
                                                    "price": amount,
                                                    "regDate": util.formatDate(new Date().toString())  
                                                }
    
                                                serviceCoinHistorys.add(country, data);
                                                
                                                let feePercentage = dbconfig.fee.coin.ont.withdraw;
                                                if(coinType == "BTC") {
                                                    feePercentage = dbconfig.fee.coin.btc.withdraw;
                                                } else if(coinType == "ETH") {
                                                    feePercentage = dbconfig.fee.coin.ether.withdraw;
                                                }
    
                                                let feeHistory = {
                                                    userId: user._doc._id,
                                                    currency: coinType,
                                                    type: "withdraw",
                                                    amount: fee_rate,
                                                    fee: feePercentage,
                                                    regDate: util.formatDate(new Date().toString())  
                                                }
                                                serviceFeeHistorys.add(country, feeHistory);
    
                                                let withdrawReqData = {
                                                    userTag: user._doc.userTag,
                                                    address: req.body.toAddress,
                                                    cryptoCurrencyCode: coinType,
                                                    amount: amount,
                                                    status: "success",
                                                    regDate: util.formatDate(new Date().toString())
                                                }
                                                serviceCoinWithdraws.add(country, withdrawReqData);
    
                                                bitwebResponse.code = 200;
                                                let resData = {
                                                    "ontTransaction":result,
                                                    "coinHistory": data,
                                                    "feeHistory": feeHistory
                                                }
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, resData);
                                                bitwebResponse.data = u_coin;
                                                res.status(200).send(bitwebResponse.create())
                                            }) .catch(err => {
                                                let withdrawReqData = {
                                                    userTag: user._doc.userTag,
                                                    address: req.body.toAddress,
                                                    cryptoCurrencyCode: coinType,
                                                    amount: amount,
                                                    status: "fail",
                                                    regDate: util.formatDate(new Date().toString())
                                                }
                                                serviceCoinWithdraws.add(country, withdrawReqData);

                                                bitwebResponse.code = 500;
                                                //API 처리 결과 별도 LOG로 남김
                                                logger.addLog(country, req.originalUrl, req.body, err);
                                                bitwebResponse.message = err;
                                                res.status(500).send(bitwebResponse.create());
                                            });                          
                                        } else {
                                            let withdrawReqData = {
                                                userTag: user._doc.userTag,
                                                address: req.body.toAddress,
                                                cryptoCurrencyCode: coinType,
                                                amount: amount,
                                                status: "fail",
                                                regDate: util.formatDate(new Date().toString())
                                            }
                                            serviceCoinWithdraws.add(country, withdrawReqData);

                                            bitwebResponse.code = 500;
                                            //API 처리 결과 별도 LOG로 남김
                                            logger.addLog(country, req.originalUrl, req.body, result);
                                            bitwebResponse.message = result;
                                            res.status(500).send(bitwebResponse.create());
                                        }
                                    }).catch(err => {
                                        let withdrawReqData = {
                                            userTag: user._doc.userTag,
                                            address: req.body.toAddress,
                                            cryptoCurrencyCode: coinType,
                                            amount: amount,
                                            status: "fail",
                                            regDate: util.formatDate(new Date().toString())
                                        }
                                        serviceCoinWithdraws.add(country, withdrawReqData);
                                        
                                        bitwebResponse.code = 500;
                                        //API 처리 결과 별도 LOG로 남김
                                        logger.addLog(country, req.originalUrl, req.body, err);
                                        bitwebResponse.message = err;
                                        res.status(500).send(bitwebResponse.create());
                                    });
                                } else {
                                    bitwebResponse.code = 200;
                                    let message = "해당 사용자의 출금 요청 횟수를 초과하였습니다. 자세한 문의는 관리자에게 문의하세요.";
                                    if(req.body.country == "EN") {
                                        message = "The number of withdrawal requests from the user has been exceeded. For more information, please contact the administrator.";
                                    }
                                    
                                    //API 처리 결과 별도 LOG로 남김
                                    logger.addLog(country, req.originalUrl, req.body, message);
                                    bitwebResponse.data = {
                                        "code": "N",
                                        "msg": message
                                    };
                                    res.status(200).send(bitwebResponse.create());
                                }
                            } else {
                                let fromDate = new Date();
                                fromDate = util.formatDatePerDay(fromDate);
                                let toDate = util.formatDate(new Date().toString());
                                let condition2 = {
                                    "type":"coinWithdraw",
                                    "regDate":{"$gte": fromDate,"$lte": toDate}
                                }
                                occurpancyNotifications.count(country, condition2)
                                .then(notiCount => {
                                    if(withdrawCount >= dbconfig.smsNotification.coinWithdraw.count.day && notiCount == 0) {
                                        //관리자에게 noti 보냄
                                        let managerList = dbconfig.smsNotification.manager;
                                        let reqDate = {
                                            type: "coinWithdraw",
                                            phones: managerList,
                                            regDate: util.formatDate(new Date().toString())
                                        }
                                        occurpancyNotifications.add(country, reqDate);
                                        
                                        let notification = "["+withdrawCount+"건]" + smsContent.manageWithdrawNotification;
                                        for(var i=0;i<managerList.length;i++) {
                                            serviceSms.sendSms(managerList[i], notification);
                                        }
                                    }
                                });

                                bitwebResponse.code = 200;
                                let message = "해당 사용자의 출금 요청 횟수를 초과하였습니다. 자세한 문의는 관리자에게 문의하세요.";
                                if(req.body.country == "EN") {
                                    message = "The number of withdrawal requests from the user has been exceeded. For more information, please contact the administrator.";
                                }
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, message);
                                bitwebResponse.data = {
                                    "code": "N",
                                    "msg": message
                                };
                                res.status(200).send(bitwebResponse.create());
                            }
                        }).catch(err => {
                            bitwebResponse.code = 500;
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, err);
                            bitwebResponse.message = err;
                            res.status(500).send(bitwebResponse.create());
                        });
                    }).catch(err => {
                        bitwebResponse.code = 500;
                        //API 처리 결과 별도 LOG로 남김
                        logger.addLog(country, req.originalUrl, req.body, err);
                        bitwebResponse.message = err;
                        res.status(500).send(bitwebResponse.create());
                    });
                });
            } else {
                bitwebResponse.code = 200;
                let message = "해당 사용자는 출금이 불가능합니다. 자세한 문의는 관리자에게 문의하세요.";
                if(req.body.country == "EN") {
                    message = "This user can not withdraw the coin. For more information, please contact the administrator.";
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, message);
                bitwebResponse.data = {
                    "code": "N",
                    "msg": message
                };
                res.status(200).send(bitwebResponse.create());
            }
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        });
    }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
});

//비트베리 API - 사용자 입금 처리 요청 (호출 시 사용자의 비트베리 앱으로 승인 요청)
//callback함수는 marketMACH 백앤드에 있음
router.post('/bitberry/deposit', token.checkInternalToken, function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let url = dbconfig.bitberry.url + "/v2/wallets";
    let coinType = req.body.coinType;
    let header = {
        'Authorization': 'Bearer ' + dbconfig.bitberry.apiKey,
        'X-Partner-User-Token': req.body.bitberry_token
    };

    request({uri: url, 
        method:'GET',
        headers: header}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result = JSON.parse(body);
            console.log('success : ', body);

            let findIndex = result.items.findIndex(function(group){
                return group.currency_code == coinType;
            });

            let walletId = result.items[findIndex].id;
            let amount = req.body.mach;
            //각 코인별로 출금
            if(result.items[findIndex].currency_code == "ETH") {
                let fee_rate = parseFloat((amount * dbconfig.fee.coin.ether.deposit).toFixed(8));
                amount = parseFloat((amount - fee_rate).toFixed(8));
            } else if(result.items[findIndex].currency_code == "BTC") {
                let fee_rate = parseFloat((amount * dbconfig.fee.coin.btc.deposit).toFixed(8));
                amount = parseFloat((amount - fee_rate).toFixed(8));
            } else {
                let fee_rate = parseFloat((amount * dbconfig.fee.coin.mach.deposit).toFixed(8));
                amount = parseFloat((amount - fee_rate).toFixed(8));
            }
            
            //시세 계산 해서 mach 넣기
            // if(result.items[findIndex].currency_code == "ETH") {
            //     let total_amount = parseFloat((amount / req.body.rate).toFixed(8));
            //     let fee_rate = parseFloat((total_amount * req.body.fee).toFixed(8));
            //     amount = total_amount + fee_rate;
            // } else if(result.items[findIndex].currency_code == "BTC") {
            //     let total_amount = parseFloat((amount / req.body.rate).toFixed(8));
            //     let fee_rate = parseFloat((total_amount * req.body.fee).toFixed(8));
            //     amount = total_amount + fee_rate;
            // }
            
            url = dbconfig.bitberry.url + "/v2/wallets/" + walletId + '/transfer_requests/withdraw';
            let param = {
                'amount': amount,
                'order_id': coinType + util.makeToken(), //프롣트에서 랜덤하게 생성?
                'item_name': "MarketMACH 입금", //프론트에서 넘김 : mach 입금
                'order_type': "charge", //프론트에서 넘김 : charge, withdraw
            };

            request({uri: url, 
                    method:'POST',
                    form: param, 
                    headers: header}, function (error, response, body) {
                if (!error && response.statusCode == 201) {
                    let result = JSON.parse(body);
                    console.log('success : ', body);
                    result['walletId'] = walletId;
                    result['transfer_request_id'] = result.id;
                    bitwebResponse.code = 200;
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, result);
                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create())
                } else {
                    bitwebResponse.code = 500;
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, req.body, error);
                    bitwebResponse.message = error;
                    console.log('error = ' + response.statusCode);
                    res.status(500).send(bitwebResponse.create())
                }
            });
        } else {
            bitwebResponse.code = 500;
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, error);
            bitwebResponse.message = error;
            res.status(500).send(bitwebResponse.create())
            console.log('error = ' + response.statusCode);
        }
    });
});

//비트베리 API - 회사 지갑에서 출금 처리 (호출 시 사용자의 비트베리 앱으로 전송)
router.post('/bitberry/withdraw', token.checkInternalToken, function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    
    serviceUsers.detail(country, {"_id":req.body.userId})
    .then(user => {
        let condition = {
            "userName": user._doc.userName,
            "birth": user._doc.birth
        }
        serviceBlackList.list(country, condition) 
        .then(blackLists => {
            if(blackLists.length == 0) {
                let url = dbconfig.bitberry.url + "/v2/partner_app/wallets";
                let coinType = req.body.coinType;
                let header = {
                    'Authorization': 'Bearer ' + dbconfig.bitberry.apiKey
                };

                request({uri: url, 
                    method:'GET',
                    headers: header}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        let result = JSON.parse(body);
                        console.log('success : ', body);

                        let findIndex = result.items.findIndex(function(group){
                            return group.currency_code == coinType;
                        });

                        let walletId = result.items[findIndex].id;
                        let url = dbconfig.bitberry.url + "/v2/wallets/" + walletId + '/airdrop';
                        let country = dbconfig.country;
                        let userTag = req.body.userTag;

                        serviceUsers.detail(country, {"userTag":userTag})
                            .then(user => {
                                serviceCoins.detail(country, {"_id":user._doc.coinId})
                                .then(coin => {
                                    let total_price = coin._doc.total_mach == undefined ? 0 : coin._doc.total_mach;
                                    if(result.items[findIndex].currency_code == "ETH") {
                                        total_price = coin._doc.total_ether == undefined ? 0 : coin._doc.total_ether;
                                    } else if(result.items[findIndex].currency_code == "BTC") {
                                        total_price = coin._doc.total_btc == undefined ? 0 : coin._doc.total_btc;
                                    }

                                    if(total_price < req.body.amount) {
                                        bitwebResponse.code = 200;
                                        bitwebResponse.message = {
                                            "code": "E001",
                                            "msg": "사용자 코인이 출금금액 보다 적습니다."
                                        };
                                        res.status(200).send(bitwebResponse.create());
                                        return;
                                    }

                                    let amount = req.body.amount;
                                    let fee_rate = parseFloat((amount * dbconfig.fee.coin.mach.withdraw).toFixed(8));
                                    amount = parseFloat((amount - fee_rate).toFixed(8));
                                    //각 코인별로 출금
                                    if(result.items[findIndex].currency_code == "ETH") {
                                        fee_rate = parseFloat((amount * dbconfig.fee.coin.ether.withdraw).toFixed(8));
                                        amount = parseFloat((amount - fee_rate).toFixed(8));
                                    } else if(result.items[findIndex].currency_code == "BTC") {
                                        fee_rate = parseFloat((amount * dbconfig.fee.coin.btc.withdraw).toFixed(8));
                                        amount = parseFloat((amount - fee_rate).toFixed(8));
                                    } 
                                    
                                    //시세 계산 해서 mach 출금
                                    // if(result.items[findIndex].currency_code == "ETH") {
                                    //     let total_amount = parseFloat((amount / req.body.rate).toFixed(8));
                                    //     let fee_rate = parseFloat((total_amount * req.body.fee).toFixed(8));
                                    //     amount = total_amount - fee_rate;
                                    // } else if(result.items[findIndex].currency_code == "BTC") {
                                    //     let total_amount = parseFloat((amount / req.body.rate).toFixed(8));
                                    //     let fee_rate = parseFloat((total_amount * req.body.fee).toFixed(8));
                                    //     amount = total_amount - fee_rate;
                                    // }

                                    let phone = (user._doc.phone.substring(0,1) == "0") ? user._doc.phone.substr(1) : user._doc.phone;
                                    let param = {
                                        'amount': amount,
                                        'memo':'withdraw from mach',
                                        'phone_number': user._doc.countryCode + phone
                                    };
                
                                    request({uri: url, 
                                            method:'POST',
                                            form: param, 
                                            headers: header}, function (error, response, body) {
                                        if (!error && response.statusCode == 201) {
                                            let result = JSON.parse(body);
                                            console.log('success : ', body);
                
                                            let data = {
                                                "extType": "bitberry",
                                                "coinId": user._doc.coinId,
                                                "category": "withdraw",          
                                                "status": result.status,
                                                "currencyCode": result.currency_code,
                                                "amount": req.body.amount,
                                                "price": req.body.amount,
                                                "regDate": util.formatDate(new Date().toString())  
                                            }
                
                                            serviceCoinHistorys.add(country, data)
                                                .then(coinHistory => {
                                                    serviceCoins.detail(country, {"_id":user._doc.coinId})
                                                        .then(coin => {
                                                            let update_data = {
                                                                "total_mach": parseFloat((coin._doc.total_mach - req.body.amount).toFixed(8))
                                                            }
                                                            if(result.currency_code == "BTC") {
                                                                update_data = {
                                                                    "total_btc": parseFloat((coin._doc.total_btc - req.body.amount).toFixed(8))
                                                                }
                                                            } else if(result.currency_code == "ETH") {
                                                                update_data = {
                                                                    "total_ether":  parseFloat((coin._doc.total_ether - req.body.amount).toFixed(8))
                                                                }
                                                            }
                                                            
                                                            serviceCoins.modify(country, {"_id":user._doc.coinId}, update_data)
                                                                .then(u_coin => {
                                                                    if(coinType != "MACH") {
                                                                        let feePercentage = (coinType == "BTC" ? dbconfig.fee.coin.btc.withdraw : dbconfig.fee.coin.ether.withdraw) 
                                                                        let feeHistory = {
                                                                            userId: user._doc._id,
                                                                            currency: coinType,
                                                                            type: "withdraw",
                                                                            amount: fee_rate,
                                                                            fee: feePercentage,
                                                                            regDate: util.formatDate(new Date().toString())  
                                                                        }
                                                                        serviceFeeHistorys.add(country, feeHistory);
                                                                    }
                                                                    bitwebResponse.code = 200;
                                                                    let resData = {
                                                                        "depositBitberry":result,
                                                                        "coinHistory": coinHistory,
                                                                        "updateCoin": u_coin
                                                                    }
                                                                    //API 처리 결과 별도 LOG로 남김
                                                                    logger.addLog(country, req.originalUrl, req.body, resData);
                                                                    bitwebResponse.data = u_coin;
                                                                    res.status(200).send(bitwebResponse.create())
                                                                }).catch(err => {
                                                                    bitwebResponse.code = 500;
                                                                    //API 처리 결과 별도 LOG로 남김
                                                                    logger.addLog(country, req.originalUrl, req.body, err);
                                                                    bitwebResponse.message = err;
                                                                    res.status(500).send(bitwebResponse.create());
                                                                });
                                                        }) .catch(err => {
                                                            bitwebResponse.code = 500;
                                                            //API 처리 결과 별도 LOG로 남김
                                                            logger.addLog(country, req.originalUrl, req.body, err);
                                                            bitwebResponse.message = err;
                                                            res.status(500).send(bitwebResponse.create());
                                                        });
                                                }).catch(err => {
                                                    bitwebResponse.code = 500;
                                                    //API 처리 결과 별도 LOG로 남김
                                                    logger.addLog(country, req.originalUrl, req.body, err);
                                                    bitwebResponse.message = err;
                                                    res.status(500).send(bitwebResponse.create());
                                                });
                                        } else {
                                            console.log('error = ' + response.statusCode);
                                            bitwebResponse.code = 500;
                                            //API 처리 결과 별도 LOG로 남김
                                            logger.addLog(country, req.originalUrl, req.body, error);
                                            bitwebResponse.message = error;
                                            res.status(500).send(bitwebResponse.create())    
                                        }
                                    });
                                });
                            }).catch((err) => {
                                bitwebResponse.code = 500;
                                //API 처리 결과 별도 LOG로 남김
                                logger.addLog(country, req.originalUrl, req.body, err);
                                bitwebResponse.message = err;
                                res.status(500).send(bitwebResponse.create())
                            });
                        } else {
                            bitwebResponse.code = 500;
                            //API 처리 결과 별도 LOG로 남김
                            logger.addLog(country, req.originalUrl, req.body, error);
                            bitwebResponse.message = error;
                            res.status(500).send(bitwebResponse.create())
                            console.log('error = ' + response.statusCode);
                        }
                    });
            } else {
                bitwebResponse.code = 200;
                let message = "해당 사용자는 출금이 불가능합니다. 자세한 문의는 관리자에게 문의하세요.";
                if(req.body.country == "EN") {
                    message = "This user can not withdraw the coin. For more information, please contact the administrator.";
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, message);
                bitwebResponse.data = {
                    "code": "N",
                    "msg": message
                };
                res.status(200).send(bitwebResponse.create());
            }
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        });
    }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
});

module.exports = router;