var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../../utils/BitwebResponse');
let dbconfig = require('../../../../../config/dbconfig');
let logger = require('../../../utils/log');
let tokens = require('../../../utils/token');

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