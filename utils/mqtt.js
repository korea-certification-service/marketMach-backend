let config = require('../config/dbconfig')
let mqtt = require('mqtt');
let mqtt_url = config.mqtt.url;
let controllerCoins = require('../backend/service/coins');
var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var private = config;
var request = require('request');

var testnet_ether = config.testnet.address.ether;
var testnet_mach = config.testnet.address.mach;
var textnet_ether_url = config.testnet.url.ether
var testnet_mach_contract = config.testnet.contract.mach;
var testnet_btc = config.testnet.address.btc;
var testnet_btc_url = config.testnet.url.btc;

const endJobCount = 5
const endJobBtcCount = 20

function btcJob(sendJson) {
    var rule = '*/2 * * * *';
    var jobCount = 0;
    var job = schedule.scheduleJob(rule, function (time) {
        console.log('answer time =>', time);

        let historyCount = sendJson.history_count;
        let country = sendJson.country;

        // console.log('historyCount=>', historyCount)

        runBtc(sendJson)
            .then(result => {
                // console.log('historyCount=>', historyCount);
                console.log('resend result=>', result);
                if (historyCount == result['count']) {
                // if (result['count'] == 13) {

                    sendJson['from'] = "btcScanSchduler"
                    sendJson['status'] = true
                    sendJson['hash'] = result['hash']
                    sendJson['value'] = result['value']
                    console.log('Ready jsonData=>', sendJson)

                    subscribeCoinScanSchduler(country, sendJson)
                    console.log('resend end job !!')
                    job.cancel();

                }
                else if (historyCount > 1 && historyCount >= result['count']) {
                    console.log("historyCount error !")
                    job.cancel();

                }
                else if (result['count'] == -1) {

                    console.log("can't read blockchain info !")
                    job.cancel();

                } else {
                    console.log('in progress!')

                    if (jobCount == endJobBtcCount) {
                        console.log('exception jobCount==>', jobCount)
                        job.cancel();
                    }
                    jobCount ++
                }
            })

    });
}
function WithdrawBtcJob(sendJson) {
    var rule = '*/2 * * * *';
    var jobCount = 0;
    var job = schedule.scheduleJob(rule, function (time) {
        console.log('resend answer time =>', time);

        let country = sendJson.country

        checkBtcWithdraw(sendJson)
            .then(count => {
                console.log('count=>', count);
                if (count == 1) {
                    sendJson['from'] = "withdrawSchduler"
                    sendJson['status'] = true
                    console.log('Ready jsonData=>', sendJson)
                    subscribeCoinScanSchduler(country, sendJson)

                    console.log('end job !!')
                    job.cancel();
                } else {
                    if (jobCount == endJobCount) {
                        console.log('exception jobCount==>', jobCount)
                        job.cancel();
                    }
                    jobCount ++
                }
            })
    });
}

function runBtc(data) {
    return new Promise((resolve, reject) => {


        let btc_address = data.btc_address;
        // let user_address = data.address;
        // let addressCount = data.historyCount;
        let btc_block = {}

        // console.log('mach_address=>', mach_address)
        // console.log('user_address=>', user_address)
        // console.log('address_count=>', addressCount)

        let url = testnet_btc_url + "/rawaddr/" + testnet_btc
        request.get(url, function (err, res, body) {
            if (err) {
                console.log('api err=>', err)
                btc_block['count'] = -1
                reject(btc_block)
            }

            let jsonBody = JSON.parse(body)
            let txs = jsonBody['txs'];

            // console.log('jsonBody:', txs)
            // console.log('result length:', txs.length)


            let count = 0;
            // console.log('txs[0].out[0].addr=>', txs[0].out[0].addr)
            console.log('txs block_height=>', txs[0].block_height)
            for (var index = 0; index < txs.length; index++) {
                // console.log('index=>' + index + ', txs[index].out[0].addr=>', txs[index].out[0].addr);
                if ( ((txs[index].out[0].addr == btc_address) || (txs[index].out[1].addr == btc_address))
                    && (txs[index].block_height != undefined)) {
                    count++;
                    console.log('ok! count =>', count);

                    if (count == 1) {
                        let btc_value = txs[index].out[1].value;
                        btc_block['hash'] = txs[index].hash;
                        btc_block['value'] = btc_value / 100000000

                    }
                }
            }

            btc_block['count'] = count;
            // console.log('btc_block=>', btc_block);
            resolve(btc_block)
        });
    });
}

function WithdrawJob(sendJson) {
    var rule = '*/2 * * * *';
    var jobCount = 0;
    var job = schedule.scheduleJob(rule, function (time) {
        console.log('answer time =>', time);

        let country = sendJson.country

        checkWithdraw(sendJson)
            .then(count => {
                console.log('count=>', count);
                if (count == 1) {
                    sendJson['from'] = "withdrawSchduler"
                    sendJson['status'] = true
                    console.log('Ready jsonData=>', sendJson)
                    subscribeCoinScanSchduler(country, sendJson)

                    console.log('end job !!')
                    job.cancel();
                } else {
                    console.log('in progress!')

                    if (jobCount == endJobCount) {
                        console.log('exception jobCount==>', jobCount)
                        job.cancel();
                    }
                    jobCount ++
                }
            })
    });
}

function checkWithdraw(data) {
    return new Promise((resolve, reject) => {

        let transaction = data.transaction;

        let url = textnet_ether_url + "/api" +
            "?module=proxy" +
            "&action=eth_getTransactionReceipt" +
            "&txhash=" + transaction +
            "&apikey=QGIFBDNP6SMZSW6WSUNB6BSRXB1UJ7M5EK";
        request.get(url, function (err, res, body) {
            // return new Promise((resolve, reject) => {
            if (err) {
                console.log('api err=>', err)
                // reject(err)
            }

            let jsonBody = JSON.parse(body)
            let result = jsonBody['result'];

            console.log('result=>', result)
            if (result != null) {
                console.log('result status => ', 'ok')
                resolve(1)
            }

            // })
        });
    });
}

function checkBtcWithdraw(data) {
    return new Promise((resolve, reject) => {

        let transaction = data.transaction;

        let url = testnet_btc_url + "/rawtx/" +
            transaction;
        request.get(url, function (err, res, body) {
            // return new Promise((resolve, reject) => {
            if (err) {
                console.log('api err=>', err)
                // reject(err)
            }

            let jsonBody = JSON.parse(body)

            console.log('jsonBody=>', jsonBody)
            if (jsonBody != undefined) {
                console.log('result status => ', 'ok')
                resolve(1)
            }

            // })
        });
    });
}

function publishEmail(data) {
    return new Promise((resolve, reject) => {
        let from = data.from;
        let to = data.to;
        let title = data.subject;
        let subject = title;
// let html = '<p>This is paragraph.</p>';
        let text = data.text;

        let mailOptions = {
            from,
            to,
            subject,
            // html,
            text,
        };

        const transporter = nodemailer.createTransport(smtpPool({
            service: private.mailer.service,
            host: private.mailer.host,
            port: private.mailer.port,
            auth: {
                user: private.mailer.user,
                pass: private.mailer.password,
            },
            tls: {
                rejectUnauthorize: false,
            },
            maxConnections: 5,
            maxMessages: 10,
        }));

        transporter.sendMail(mailOptions, (err, res) => {
            if (err) {
                console.log('failed... => ', err);
                reject(err)
            } else {
                console.log('succeed... => ', res);
                resolve(res)
            }

            transporter.close();
        });
    })
}

function subscribeCoinScanSchduler(country, sendJson) {

    console.log('checked coinScan API !');
    let type = sendJson.type;

    if ((sendJson['type'] == "btc_withdraw")
        || (sendJson['type'] == "ether_withdraw")
        || (sendJson['type'] == "mach_withdraw")) {

        console.log('withdraw ok!')

        let subtractMach = Number(sendJson.total_mach) - Number(sendJson.mach);
        let completedPrice = subtractMach;

        let totalCoinJson = {};
        totalCoinJson['total_mach'] = subtractMach;

        controllerCoins.updateTotalCoin(country, sendJson.coinId, totalCoinJson)
            .then(result => {
                console.log('finished add coin ==>', result);

                let history = {
                    "completedPrice": completedPrice,
                    "type": type
                }
                controllerCoins.updateCoinHistoryStatusById(country, sendJson.historyId, history)
                    .then(result => {
                        console.log('update ' + type + ' history status!');
                    })
            }).catch((err) => {
            console.error('err=>', err)
        })
    }
}

exports.btcJob = btcJob;
exports.WithdrawBtcJob = WithdrawBtcJob;
exports.WithdrawJob = WithdrawJob;
exports.publishEmail = publishEmail;

