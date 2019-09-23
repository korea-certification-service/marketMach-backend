let express = require('express');
let router = express.Router();
var BitwebResponse = require('../../../utils/BitwebResponse')
let serviceSms = require('../../../service/sms');
var serviceOccupancyPhones = require('../../../service/occurpancyPhone');
const smsContent = require('../../../../../config/sms');
const dbconfig = require('../../../../../config/dbconfig');
const util = require('../../../utils/util');
let token = require('../../../utils/token');

router.post('/user/checkMobile', token.checkInternalToken, function(req,res,next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let authCode = util.makeNumber();
    
    let reqData = {
        'country': country,
        'countryCode':req.body.countryCode,
        'phone': req.body.phone,
        'authCode': authCode,
        'regDate': util.formatDate(new Date().toString())
    }

    //긴급 패치
    if(req.body.countryCode == "+7") {
        bitwebResponse.code = 200;
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
            fromDate.setHours(fromDate.getHours() - 1);
            fromDate = util.formatDatePerHour(fromDate);
            let toDate = util.formatDatePerHour(new Date().toString());
            let condition = {
                "regDate":{"$gte": fromDate,"$lte": toDate}
            }
            //config에 설정된 건수보다 많이 발생한 경우 SMS Noti날린다.
            serviceOccupancyPhones.count(country, condition)
            .then(count => {
                if(count >= dbconfig.smsNotification.sendSms.count.hour) {
                    let managerList = dbconfig.smsNotification.manager;
                    let notification = "["+count+"건]" + smsContent.manageNotification;
                    for(var i=0;i<managerList.length;i++) {
                        serviceSms.sendSms(managerList[i], notification);
                    }
                }
                bitwebResponse.code = 200;
                bitwebResponse.data = result;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
                console.error('err=>', err)
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
    }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })     
})

module.exports = router;