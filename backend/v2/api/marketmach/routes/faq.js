/**
 * FAQ API
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-03
 */
var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let logger = require('../../../utils/log');
let token = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')
let serviceFaq = require('../../../service/faq');

//FAQ 목록 조회 API
router.post('/list', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let condition = {};
    if(req.body.param.country == "KR") {        
        condition['country'] = {$exists: false};
    }
    let option = req.body.option;
    let country = dbconfig.country;

    serviceFaq.count(country, condition, option)
    .then(count => {
        serviceFaq.list(country, condition, option)
        .then(list => {
            bitwebResponse.code = 200;
            let resData = {
                "successYn": "Y",
                "count": count,
                "list": list
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, resData);
            bitwebResponse.data = resData;

            let jsonResult = bitwebResponse.create();

            jsonResult['pageIdx'] = option.pageIdx;
            jsonResult['perPage'] = option.perPage;

            res.status(200).send(jsonResult);
        }).catch((err) => {
            console.error('list faq error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, err);
    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        });
    }).catch((err) => {
        console.error('count faq error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    });
});

//FAQ 상세 조회 API
router.get('/detail/:faqId', token.checkInternalToken, function (req, res, next) {
    let country = dbconfig.country;
    let bitwebResponse = new BitwebResponse();
    let condition = {
        "_id" : req.params.faqId
    }

    serviceFaq.detail(country, condition)
    .then(faq => {
        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "faq": faq
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.data = faq;
        res.status(200).send(bitwebResponse.create());
    }).catch((err) => {
        console.error('count faq error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router;