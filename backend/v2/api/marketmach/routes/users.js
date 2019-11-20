/**
 * 사용자 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-11
 */
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
let tokens = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')
let serviceUsers = require('../../../service/users')
let serviceAgreements = require('../../../service/agreements');

//로그인 API(사용 안함)
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
                //로그인 확인을 위한 쿠키 생성
                res.cookie("login_token", tokens.makeLoginToken(loginToken), {
                    expires: new Date(Date.now() + (60 * 60 * 1000)), //1시간
                });

                let resData = {
                    "userTag": updateUser.userTag, 
                    "userId": updateUser._id, 
                    "active": updateUser.active,
                    "userInfo": updateUser,
                    "agreement": agreement
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, resData);

                bitwebResponse.code = 200;
                bitwebResponse.data = resData;                
                res.status(200).send(bitwebResponse.create())

            }).catch((err) => {        
                console.error('login token update error =>', err);
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err.message);
                let resErr = "처리중 에러 발생";
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {        
            console.error('login token update error =>', err);
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err.message);
            let resErr = "처리중 에러 발생";
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {        
        console.error('login error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);
        let resErr = "Incorrect ID or password";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});


//ontology 로그인 API
router.post('/ontId/login', async function (req, res, next) {
    let country = dbconfig.country;
    let bitwebResponse = new BitwebResponse();
    let condition = {
        'ontId': 'did:ont:' + req.body.result.user,
    }

    try{
        let user = await serviceUsers.detail(country, condition);    
        let agreement = null;
        let updatedUser = null;

        if(user == null) {
            user = {
                'exist': false,
                'ontId':'did:ont:' + req.body.result.user
            };
        } else {
            user._doc['exist'] = true;
            agreement = await serviceAgreements.detail(country, {"_id":user._doc.agreementId});    
            let loginToken = util.makeToken();
            let updateData = {
                'loginToken': loginToken
            }
            updatedUser = await serviceUsers.modify(country,{"_id":user._doc._id}, updateData);
        }

        let resData = {
            "getUser": user,
            "agreement": agreement,
            "updatedUser": updatedUser
        };
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.code = 200;
        bitwebResponse.data = resData;                
        res.status(200).send(bitwebResponse.create());
    } catch (err) {
        console.error('login error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);
        let resErr = "ontId error.";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

module.exports = router;
