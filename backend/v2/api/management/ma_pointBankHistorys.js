/**
 * 관리자 - 포인트 bank history API(현재 사용 안함)
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var BitwebResponse = require('../../utils/BitwebResponse');
var PointBankHistorys = require('../../model/pointBankHistorys');
let pagination = require('../../service/_pagination');
let dbconfig = require('../../../../config/dbconfig');

//coin history 조회 API
router.get("/list/:pointId", (req, res) => {

    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging({
        model: PointBankHistorys,
        condition: {'pointId': req.params.pointId},
        limit: req.query.limit,
        skip: req.query.skip,
        // search: {'type': req.query.search}
        search: { key: req.query.key, val: req.query.val }
    })
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