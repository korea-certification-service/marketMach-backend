/**
 * 사용자 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-03
 */
var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let util = require('../../utils/util');
let logger = require('../../utils/log');
let token = require('../../utils/token');
let BitwebResponse = require('../../utils/BitwebResponse')
let serviceShopBuyers = require('../../service/shopBuyers');

//사용자 이벤트 상품 구매 조회 API
router.get('/buyer/list/:country', async function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {};
    if(req.params.country == "KR") {
        condition['country'] = {$exists:false};        
    }    
    let option = {
        pageIdx: req.query.pageIdx == undefined ? 0 : req.query.pageIdx,
        perPage: 1000
    };

    try {
        let count = await serviceShopBuyers.count(country, condition, option);
        let list = await serviceShopBuyers.list(country, condition, option);

        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "count": count,
            "list": list
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = resData;

        let jsonResult = bitwebResponse.create();

        jsonResult['pageIdx'] = option.pageIdx;
        jsonResult['perPage'] = option.perPage;

        res.status(200).send(jsonResult);
    } catch(err) {
        console.error('list shop error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

module.exports = router;