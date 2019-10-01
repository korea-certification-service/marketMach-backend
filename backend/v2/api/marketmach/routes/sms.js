let express = require('express');
let router = express.Router();
var BitwebResponse = require('../../../utils/BitwebResponse')
let serviceSms = require('../../../service/sms');
let serviceOccupancyPhones = require('../../../service/occurpancyPhone');
var occurpancyNotifications = require('../../../service/occurpancyNotification');
const smsContent = require('../../../../../config/sms');
const dbconfig = require('../../../../../config/dbconfig');
const util = require('../../../utils/util');
let token = require('../../../utils/token');
let logger = require('../../../utils/log');

router.post('/user/checkMobile', token.checkInternalToken, function(req,res,next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let authCode = util.makeNumber();
    
    let reqData = {
        'country': req.body.country,
        'countryCode':req.body.countryCode,
        'phone': req.body.phone,
        'authCode': authCode,
        'regDate': util.formatDate(new Date().toString())
    }

    //긴급 패치
    if(req.body.countryCode == "+7") {
        bitwebResponse.code = 200;
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqData, "Russia Skip!!");
        bitwebResponse.data = "{\"data\":\"true\"}";
        res.status(200).send(bitwebResponse.create());
        return;
    }

    serviceOccupancyPhones.add(country, reqData)
    .then(() => {
        //SMS인증 후 인증번호 회신
        let phone = req.body.countryCode + req.body.phone;
        let message = "" + reqData.authCode + " - " + smsContent.authSms[country];
        serviceSms.sendSms(phone, message)
        .then((result) => {
            let fromDate = new Date();
            fromDate = util.formatDatePerHour(fromDate);
            let toDate = util.formatDate(new Date().toString());
            let condition = {
                "regDate":{"$gte": fromDate,"$lte": toDate}
            }
            //config에 설정된 건수보다 많이 발생한 경우 SMS Noti날린다.
            serviceOccupancyPhones.count(country, condition)
            .then(count => {
                let condition2 = {
                    "type":"checkMobile",
                    "regDate":{"$gte": fromDate,"$lte": toDate}
                }
                occurpancyNotifications.count(country, condition2)
                .then(notiCount => {
                    if(count >= dbconfig.smsNotification.sendSms.count.hour && notiCount == 0) {
                        let managerList = dbconfig.smsNotification.manager;
                        let reqDate = {
                            type: "checkMobile",
                            phones: managerList,
                            regDate: util.formatDate(new Date().toString())
                        }
                        occurpancyNotifications.add(country, reqDate);
                        
                        let notification = "["+count+"건]" + smsContent.manageNotification;
                        for(var i=0;i<managerList.length;i++) {
                            serviceSms.sendSms(managerList[i], notification);
                        }
                    }
                    let resData = {
                        "sendSms":result,
                        "OccupancyPhoneCount": count,
                        "notiCount": notiCount
                    }
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, reqData, resData);

                    bitwebResponse.code = 200;
                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create())
                }).catch((err) => {
                    console.error('err=>', err)
                    //API 처리 결과 별도 LOG로 남김
                    logger.addLog(country, req.originalUrl, reqData, err);
                    bitwebResponse.code = 200;
                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create())
                })
            }).catch((err) => {
                console.error('err=>', err)
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, reqData, err);
                bitwebResponse.code = 200;
                bitwebResponse.data = result;
                res.status(200).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('err=>', err)
            //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqData, err);
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('err=>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqData, err);
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })     
})

module.exports = router;