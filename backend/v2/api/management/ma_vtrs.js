/**
 * 게임거래내역 API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var Vtrs = require('../../model/vtrs');
let pagination = require('../../service/_pagination');

router.get("/list/:_id", (req, res) => {

    let condition = {
        $or: [
            {from_userId: req.params._id},
            {to_userId: req.params._id}
        ]
    }

    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging({
        model: Vtrs,
        condition: condition,
        limit: req.query.limit,
        skip: req.query.skip,
        // search: {'item._id': req.query.search }
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

// router.get("/list/:to_userId/buyer", (req, res) => {
//     let country = dbconfig.country;
//     let condition = {
//         'to_userId': req.params.to_userId,
//         "item.category": req.query.search
//     }
//     let bitwebResponse = new BitwebResponse();

//     console.log(req.query);

//     pagination.paging(req, res, Vtrs, country, condition, 'item.category')
//     .then(data => {
//         res.status(200).send(data);
//     })
//     .catch(err => {
//         console.error('data error =>', err);
//         let resErr = "there is no data";
//         bitwebResponse.code = 500;
//         bitwebResponse.message = resErr;
//         res.status(500).send(bitwebResponse.create())
//     })
// });

module.exports = router; 