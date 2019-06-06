let BitwebResponse = require('../../utils/BitwebResponse');
let serviceCoins = require('../service/coins');
let util = require('../../utils/util');
var mqtt = require('../../utils/mqtt');
let ethereumWeb3 = require('../../utils/ethereumWeb3');
let bitcore_lib = require('../../utils/bitcore_lib');

function listCoinDepositHistory(req, res) {
    let bitwebResponse = new BitwebResponse();

    serviceCoins.listCoinDepositHistory(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
}

function listCoinWithdrawHistory(req, res) {
    let bitwebResponse = new BitwebResponse();

    serviceCoins.listCoinWithdrawHistory(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
}


function updateBtcCoinDepositHistory(req, res) {
    let bitwebResponse = new BitwebResponse();

    serviceCoins.updateBtcCoinDepositHistory(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create());
    })
}

function updateEtherCoinDepositHistory(req, res) {
    let bitwebResponse = new BitwebResponse();

    serviceCoins.updateEtherCoinDepositHistory(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create());
    })
}

function updateMachCoinDepositHistory(req, res) {
    let bitwebResponse = new BitwebResponse();

    serviceCoins.updateMachCoinDepositHistory(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create());
    })
}

function updateWithdrawHistory(req, res) {
    let bitwebResponse = new BitwebResponse();
    let coinId = req.body.coinId;
    let coinType = req.params.coinType;
    let address = req.body.address;
    let mach = req.body.mach;
    let price = req.body.price;
    let country = req.body.country;
    let historyId = req.body.historyId;

    if (coinType == "ether" || coinType == "mach") {
        let data = {}
        data['type'] = coinType;
        data['price'] = price;
        data['address'] = address;

        ethereumWeb3.withDraw(data)
            .then(transaction => {
                console.log('withDraw() =>', transaction);
                let data = {}
                data['coinType'] = coinType;
                // data['mach'] = mach;
                // data['price'] = price;
                // data['address'] = address;
                data['transaction'] = transaction;

                serviceCoins.updateCoinWithdrawHistoryById(country, historyId, data)
                    .then(result => {
                        serviceCoins.getCoinById(country, coinId)
                            .then(coin => {
                                console.log('getCoin result=>', coin);

                                let jsonData = {}
                                jsonData['coinId'] = coinId;
                                jsonData['historyId'] = historyId;
                                jsonData['type'] = coinType + "_withdraw";
                                jsonData['price'] = price;
                                jsonData['address'] = address;
                                jsonData['transaction'] = transaction;
                                jsonData['mach'] = mach;
                                jsonData['total_mach'] = coin.total_mach;
                                jsonData['country'] = country;

                                mqtt.WithdrawJob(jsonData)

                                bitwebResponse.code = 200;
                                bitwebResponse.data = result;
                                res.status(200).send(bitwebResponse.create())

                            }).catch(err => {
                                console.log('err=>', err);
                            })
                    }).catch((err => {
                        console.error('err=>', err)
                    }))
            })
    } else if (coinType == "btc") {
        bitcore_lib.sendBtcTransaction(req.body)
            .then(transaction => {
                console.log('sendBtcTransaction() =>', transaction);
                let data = {}
                data['coinType'] = coinType;
                // data['mach'] = mach;
                // data['price'] = price;
                // data['address'] = address;
                data['transaction'] = transaction;

                serviceCoins.updateCoinWithdrawHistoryById(country, historyId, data)
                    .then(result => {
                        serviceCoins.getCoinById(country, coinId)
                            .then(coin => {
                                console.log('getCoin result=>', coin);

                                let jsonData = {}
                                jsonData['coinId'] = coinId;
                                jsonData['historyId'] = historyId;
                                jsonData['type'] = coinType + "_withdraw";
                                jsonData['price'] = price;
                                jsonData['address'] = address;
                                jsonData['transaction'] = transaction;
                                jsonData['mach'] = mach;
                                jsonData['total_mach'] = coin.total_mach;
                                jsonData['country'] = country;


                                mqtt.WithdrawBtcJob(jsonData)

                                bitwebResponse.code = 200;
                                bitwebResponse.data = result;
                                res.status(200).send(bitwebResponse.create())

                            }).catch(err => {
                                console.log('err=>', err);
                            })
                    }).catch(err => {
                        console.log('err=>', err);
                    })
            }).catch(err => {
                console.log('err=>', err);
            })

    } else {
        console.log("coinType undefined!")
    }
}

exports.listCoinDepositHistory = listCoinDepositHistory;
exports.listCoinWithdrawHistory = listCoinWithdrawHistory;
exports.updateBtcCoinDepositHistory = updateBtcCoinDepositHistory;
exports.updateEtherCoinDepositHistory = updateEtherCoinDepositHistory;
exports.updateMachCoinDepositHistory = updateMachCoinDepositHistory;
exports.updateWithdrawHistory = updateWithdrawHistory;
