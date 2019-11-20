/**
 * 공통 API(현재 사용 안함)
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

module.exports = router;