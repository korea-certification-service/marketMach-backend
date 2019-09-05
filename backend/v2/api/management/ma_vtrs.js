/**
 * 게임거래내역 API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var Vtrs = require('../../service/vtrs.js');
var Items = require("../../service/items");

//게임판매내역 조회  API
router.get("/:from_userId/sell", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'from_userId': req.params.from_userId
    }
    let bitwebResponse = new BitwebResponse();
    Vtrs.list(country, condition)
    .then(async data => {
        res.send(200,  data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//게임구매내역 조회  API
router.get("/:to_userId/buy", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'to_userId': req.params.to_userId
    }
    let bitwebResponse = new BitwebResponse();
    Vtrs.list(country, condition)
    .then(data => {
        res.send(200,  data);
        //console.log(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});


module.exports = router; 