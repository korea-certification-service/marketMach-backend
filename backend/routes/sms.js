let express = require('express');
let router = express.Router();
let smsController = require('../controllers/sms');
var controllerItems = require('../controllers/items')
var BitwebResponse = require('../utils/BitwebResponse')
const controllerVtrs = require('../controllers/vtrs')
const shortUrl = require('node-url-shortener')
const dbconfig = require('../config/dbconfig')

router.get('/vtr/:country/:userId/:itemId', function(req, res, next) {
    let userId = req.params.userId;
    let itemId = req.params.itemId;
    let country = req.params.country;
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    let data = {"roomToken": text, "status": 1};
    var bitwebResponse = new BitwebResponse();

    controllerItems.getByItemId(country, itemId, "", "")
        .then((item) => {
            req.body['item'] = item;
            req.body['cmod'] = "deal";
            req.body['country'] = country;
            req.body['roomToken'] = text;
            if(item._doc.trade_type == "buy") {
                req.body['buyer_id'] = item._doc.userTag;
                req.body['seller_id'] = userId;
            } else {
                req.body['buyer_id'] = userId;
                req.body['seller_id'] = item._doc.userTag;
            }
            controllerVtrs.createVtrTemp(req)
                .then((vtrTemp) => {
                    data['vtrTempId'] = vtrTemp._doc._id;
                    controllerItems.updateById(country, itemId, data)
                        .then((result) => {
                            console.log("HOST : ", req.headers.host);
                            console.log("SMS URL : ", from_req_url, to_req_url);
                            if(req.headers.host.indexOf("marketmach") > 0) {
                                //let req_url = 'https://www.marketmach.com/room?itemId='+itemId+'&user_id=' + userId + '&vtrTempId=' + vtrTemp._doc._id;
                                //result._doc['resultUrl'] = reqFromUrl;
                                let from_req_url, to_req_url;
                                if(item._doc.trade_type == "buy") {
                                    from_req_url = 'https://www.marketmach.com/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + userId + '&vtrTempId=' + vtrTemp._doc._id;
                                    to_req_url = 'https://www.marketmach.com/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + item._doc.userTag + '&vtrTempId=' + vtrTemp._doc._id;
                                } else {
                                    to_req_url = 'https://www.marketmach.com/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + userId + '&vtrTempId=' + vtrTemp._doc._id;
                                    from_req_url = 'https://www.marketmach.com/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + item._doc.userTag + '&vtrTempId=' + vtrTemp._doc._id;
                                }

                                shortUrl.short(encodeURIComponent(from_req_url), function (err, resultUrl) {
                                    console.log(resultUrl);
                                    req.body.from_url = resultUrl;
                                    shortUrl.short(encodeURIComponent(to_req_url), function (err, resultUrl1) {
                                        req.body.to_url = resultUrl1;
                                        smsController.sendSms(req, res, 'yes')
                                            .then(() => {
                                                bitwebResponse.code = 200;
                                                bitwebResponse.data = item._doc.trade_type == "buy" ? from_req_url : to_req_url;
                                                res.status(200).send(bitwebResponse.create())
                                            });
                                    }).catch((err) => {
                                        console.error('err=>', err)
                                        bitwebResponse.code = 500;
                                        bitwebResponse.message = err;
                                        res.status(500).send(bitwebResponse.create())
                                    });
                                });
                            } else {
                                // let req_url = 'http://' + req.headers.host + '/room?itemId='+itemId+'&user_id=' + userId + '&vtrTempId=' + vtrTemp._doc._id;
                                // req.body['req_url'] = req_url;
                                let from_req_url, to_req_url;
                                if(item._doc.trade_type == "buy") {
                                    from_req_url = 'http://' + req.headers.host + '/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + userId + '&vtrTempId=' + vtrTemp._doc._id;
                                    to_req_url = 'http://' + req.headers.host + '/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + item._doc.userTag + '&vtrTempId=' + vtrTemp._doc._id;
                                } else {
                                    to_req_url = 'http://' + req.headers.host + '/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + userId + '&vtrTempId=' + vtrTemp._doc._id;
                                    from_req_url = 'http://' + req.headers.host + '/sms/room?roomToken='+text+'&itemId=' + itemId + '&user_id=' + item._doc.userTag + '&vtrTempId=' + vtrTemp._doc._id;
                                }
                                req.body['from_url'] = from_req_url;
                                req.body['to_url'] = to_req_url;

                                smsController.sendSms(req, res, 'no')
                                    .then(() => {
                                        bitwebResponse.code = 200;
                                        bitwebResponse.data = item._doc.trade_type == "buy" ? from_req_url : to_req_url;
                                        res.status(200).send(bitwebResponse.create())
                                    }).catch((err) => {
                                    console.error('err=>', err)
                                    bitwebResponse.code = 500;
                                    bitwebResponse.message = err;
                                    res.status(500).send(bitwebResponse.create())
                                });
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
});

router.post('/url_test', function(req, res, next) {
    let shortUrl = require('node-url-shortener');
    let url = req.body.url;
    var bitwebResponse = new BitwebResponse();

    shortUrl.short(url, function(err, result){
        console.log(result);
        bitwebResponse.code = 200;
        bitwebResponse.data = result;
        res.status(200).send(bitwebResponse.create())
    });
});


router.get('/vtr/notification/:country/:itemId/:userTag', function(req, res, next) {
    var bitwebResponse = new BitwebResponse();

    let country = req.params.country;
    let itemId = req.params.itemId;
    let fromUserTag = req.params.userTag;

    controllerVtrs.getVtrTempByItemId(country, itemId)
        .then((vtrTemp) => {
            let targetUserTag = "";
            if(vtrTemp._doc.buyer_id != fromUserTag) {
                targetUserTag = vtrTemp._doc.buyer_id;
            } else if(vtrTemp._doc.seller_id != fromUserTag) {
                targetUserTag = vtrTemp._doc.seller_id;
            }

            let url_output = 'http://' + req.headers.host + '/sms/room?roomToken='+vtrTemp._doc.roomToken+'&itemId=' + itemId + '&user_id=' + targetUserTag + '&vtrTempId=' + vtrTemp._doc._id;
            if(req.headers.host.indexOf("marketmach") > 0) {
                url_output = 'https://www.marketmach.com/sms/room?roomToken='+vtrTemp._doc.roomToken+'&itemId=' + itemId + '&user_id=' + targetUserTag + '&vtrTempId=' + vtrTemp._doc._id;
                shortUrl.short(encodeURIComponent(url_output), function (err, resultUrl) {
                    console.log(resultUrl);
                    smsController.sendNotification(country, fromUserTag, targetUserTag, resultUrl, 'yes')
                        .then((result) => {
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
            } else {
                smsController.sendNotification(country, fromUserTag, targetUserTag, url_output, 'no')
                    .then((result) => {
                        bitwebResponse.code = 200;
                        bitwebResponse.data = result;
                        res.status(200).send(bitwebResponse.create())
                    }).catch((err) => {
                    console.error('err=>', err)
                    bitwebResponse.code = 500;
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create())
                });
            }
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});


module.exports = router;