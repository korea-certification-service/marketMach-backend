var express = require('express');
var router = express.Router();
let crypto = require('crypto');
let CryptoJS = require("crypto-js");
let request = require('request');
let md5 = require('md5');
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let validation = require('../../../utils/validation');
let logger = require('../../../utils/log');
let BitwebResponse = require('../../../utils/BitwebResponse')
let serviceUsers = require('../../../service/users')
let serviceAgreements = require('../../../service/agreements');
// let controllerCoins = require('../service/coins');
// let controllerPoints = require('../service/points');

//로그인 API
router.post('/login', function (req, res, next) {
    let country = dbconfig.country;
    let password = crypto.createHash('sha256').update(req.body.password).digest('base64');
    let condition = {
        'country': country,
        'userTag': req.body.userTag,
        'password': password
    }
    console.log('req login => ', condition);

    let bitwebResponse = new BitwebResponse();
    serviceUsers.detail(country, condition)
    .then((user) => {
        let loginToken = util.makeToken();
        let setData = {
            'loginToken': loginToken
        };
        let search = {
            '_id': user._doc.agreementId
        }
        let condition2 = {
            'userTag': user._doc.userTag
        }

        serviceUsers.modify(country, condition2, setData)
        .then((updateUser) => {
            serviceAgreements.detail(country, search)
            .then((agreement) => {
                console.log('res user info => ', updateUser, agreement);
                // //로그인 확인을 위한 쿠키 생성
                // let key = CryptoJS.enc.Hex.parse("0123456789abcdef0123456789abcdef"); // key 값 > 변경가능
                // let iv =  CryptoJS.enc.Hex.parse("abcdef9876543210abcdef9876543210"); // iv 값 > 변경가능
                // let cookie_string = user._doc.userTag+'|'+ loginToken; // "|" 로 구분
                // let orange__F = CryptoJS.AES.encrypt(cookie_string, key, {iv:iv}); // 쿠키명 = orange__T
                // orange__F = orange__F.ciphertext.toString(CryptoJS.enc.Base64);  //and the ciphertext put to base64
                // res.cookie("orange__F",orange__F, {
                //     domain: 'marketmach.com',
                //     expires: new Date(Date.now() + (60 * 60 * 1000)), //1시간
                // });

                // res.cookie("orange__F",orange__F, {
                //     expires: new Date(Date.now() + (60 * 60 * 1000)), //1시간
                // });

                let resData = {
                    "userTag": updateUser.userTag, 
                    "userId": updateUser._id, 
                    "active": updateUser.active,
                    "userInfo": updateUser,
                    "agreement": agreement
                }
                logger.addLog(country, req.originalUrl, JSON.stringify(req.body), JSON.stringify(resData));

                bitwebResponse.code = 200;
                bitwebResponse.data = resData;                
                res.status(200).send(bitwebResponse.create())

            }).catch((err) => {        
                console.error('login token update error =>', err);
                let resErr = "처리중 에러 발생";
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {        
            console.error('login token update error =>', err);
            let resErr = "처리중 에러 발생";
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {        
        console.error('login error =>', err);
        let resErr = "Incorrect ID or password";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});


// router.post('/list', function (req, res, next) {
//     serviceUsers.list
// });
module.exports = router;
