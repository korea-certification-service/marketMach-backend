/**
 * 사용자 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-24
 */
var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let logger = require('../../../utils/log');
let token = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')
let serviceItems = require('../../../service/items');

//아이템 상세조회 API
router.get('/:itemId', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let conditionItem = {
        "_id": itemId
    }
    
    serviceItems.detail(country, conditionItem)
    .then((item) => {    
        bitwebResponse.code = 200;
        bitwebResponse.data = item;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('get item error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
});

module.exports = router;