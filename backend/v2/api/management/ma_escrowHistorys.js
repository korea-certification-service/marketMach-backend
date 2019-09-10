/**
 * escrowHistory API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var EscrowHistorys = require('../../model/escrows');
let pagination = require('../../service/_pagination');

//escrow history 조회 API
router.get("/list/:userId", (req, res) => {

    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging({
        model: EscrowHistorys,
        condition: {'reqUser': req.params.userId},
        limit: req.query.limit,
        skip: req.query.skip,
        search: {'type': req.query.search}
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