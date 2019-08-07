/**
 * KYC API
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-11
 */
var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../../utils/BitwebResponse');
let dbconfig = require('../../../../../config/dbconfig');
let logger = require('../../../utils/log');
let tokens = require('../../../utils/token');
let serviceKyc = require('../../../service/kyc');
let serviceUser = require('../../../service/users');
let serviceAgreement = require('../../../service/agreements');

//kyc 등록 API
router.post('/', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let body = req.body;
    body['verification'] = false;
    let country = dbconfig.country;
    let conditionUser = {
        "_id": body.userId
    }

    serviceUser.detail(country, conditionUser)
    .then(user => {
        if(user == null) {
            console.error('get user error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, body, err);
    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
            return;
        }
        let conditionAgreement = {
            "_id": user._doc.agreementId
        }
        let updateAgreement = {
            "kyc": false
        }

        serviceKyc.add(country, body)
        .then(addKyc => {
            serviceAgreement.modify(country, conditionAgreement, updateAgreement) 
            .then(modifyAgreement => {
                bitwebResponse.code = 200;
                let resData = {
                    "addKyc": addKyc,
                    "modifyAgreement": modifyAgreement
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, body, resData);

                bitwebResponse.data = addKyc;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
                console.error('modify agreement error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, body, err);
    
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('add kyc error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, body, err);

            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    });
});

//kyc 조회 API
router.get('/:userId', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let userId = req.params.userId;
    let country = dbconfig.country;
    let condition = {
        "userId": userId
    }
    
    serviceKyc.detail(country, condition)
    .then((kyc) => {    
        bitwebResponse.code = 200;
        let resData = {
            "kyc": kyc
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, userId, resData);

        bitwebResponse.data = kyc;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('get kyc error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, userId, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
});


//kyc 수정 API
router.put('/:userId', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let condition = {
        "userId": req.params.userId
    };
    let body = req.body;
    body['verification'] = false;
    let country = dbconfig.country;
    let conditionUser = {
        "_id": req.params.userId
    }

    serviceUser.detail(country, conditionUser)
    .then(user => {
        if(user == null) {
            console.error('get user error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, body, err);
    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
            return;
        }
        let conditionAgreement = {
            "_id": user._doc.agreementId
        }
        let updateAgreement = {
            "kyc": false
        }

        serviceKyc.modify(country, condition, body)
        .then(modifyKyc => {
            serviceAgreement.modify(country, conditionAgreement, updateAgreement) 
            .then(modifyAgreement => {
                bitwebResponse.code = 200;
                let resData = {
                    "modifyKyc": modifyKyc,
                    "modifyAgreement": modifyAgreement
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, body, resData);

                bitwebResponse.data = modifyKyc;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
                console.error('modify agreement error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, body, err);
    
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('modify kyc error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, body, err);

            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('get user error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    });
});


module.exports = router;