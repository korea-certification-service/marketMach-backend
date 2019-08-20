/**
 * coin history API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-16
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var coinHistorys = require('../../service/coinHistorys');

//coin history 조회 API
router.get("/:coinId/:category", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'coinId': req.params.coinId,
        'category': req.params.category
    }
    let bitwebResponse = new BitwebResponse();
    coinHistorys.list(country, condition)
    .then(data => {
        res.send(200,  data);
        console.log(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
    console.log(req.params);
});

module.exports = router; 