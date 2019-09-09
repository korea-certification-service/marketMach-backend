/**
 * 사용자 API
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
let serviceNotice = require('../../../service/notice');

router.get('/list', function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let condition = {}
    let option = {
        "perPage": 20,
        "pageIdx": 0
    }
    let country = dbconfig.country;
    serviceNotice.count(country, condition, option)
    .then(count => {
        serviceNotice.list(country, conditionm, option)
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

            if (data.pageIdx != undefined) data.pageIdx = pageIdx ? data.pageIdx : 0
            if (data.perPage != undefined) data.perPage = perPage ? data.perPage : 10

            jsonResult['pageIdx'] = data.pageIdx;
            jsonResult['perPage'] = data.perPage;

            res.status(200).send(jsonResult);
        }).catch((err) => {
            console.error('list notice error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, err);
    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        });
    }).catch((err) => {
        console.error('count notice error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    });
});

router.get('/detail/:noticeId', function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let condition = {
        "_id" : req.params.noticeId
    }

    serviceNotice.detail(country, condition)
    .then(notice => {
        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "notice": notice
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.data = notice;
        res.status(200).send(bitwebResponse.create());
    }).catch((err) => {
        console.error('detail notice error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router;