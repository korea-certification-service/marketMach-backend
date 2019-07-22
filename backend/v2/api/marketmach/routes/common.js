/**
 * 공통 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-11
 */
var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../../utils/BitwebResponse');
let dbconfig = require('../../../../../config/dbconfig');
let logger = require('../../../utils/log');
let tokens = require('../../../utils/token');

//Login Token 체크 API
router.get('/', tokens.checkLoginToken, function(req, res, next){
    res.status(200).send('login 화면');
});

// router.get('/error', function (req, res, next) {
//     let country = dbconfig.country;
//     let bitwebResponse = new BitwebResponse();

//     logger.addLog(country, req.originalUrl, req.query.params, req.query.error);
//     let resErr = "Token 처리 중 문제가 발생하였습니다.";
//     bitwebResponse.code = 500;
//     bitwebResponse.message = resErr;
//     res.status(500).send(bitwebResponse.create())
// });

module.exports = router;