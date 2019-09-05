/**
 * pint bank history API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var PointBankHistorys = require('../../model/pointBankHistorys');
let pagination = require('../../service/_pagination');

//coin history 조회 API
router.get("/list/:pointId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'pointId': req.params.pointId
    }
    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging(req, res, PointBankHistorys, country, condition, 'type')
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