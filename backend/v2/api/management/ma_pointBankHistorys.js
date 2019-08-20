/**
 * pint bank history API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var PointBankHistorys = require('../../service/pointBankHistorys');

//coin history 조회 API
router.get("/:pointId/:type", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'pointId': req.params.pointId,
        'type': req.params.type
    }
    let bitwebResponse = new BitwebResponse();
    PointBankHistorys.list(country, condition)
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