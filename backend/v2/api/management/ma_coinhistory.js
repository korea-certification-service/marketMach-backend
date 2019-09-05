/**
 * coin history API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-16
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var coinHistorys = require('../../model/coinHistorys');
let pagination = require('../../service/_pagination');

//coin history 조회 API
router.get("/list/:coinId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'coinId': req.params.coinId,
        'category': req.query.search
    }
    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging(req, res, coinHistorys, country, condition, 'category')
    .then(data => {
        res.status(200).send(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        let resErr = "there is no data";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router; 