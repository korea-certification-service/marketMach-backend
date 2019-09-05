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

router.get("/list/:from_userId/seller", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'from_userId': req.params.from_userId,
        "item.category": req.query.search
    }
    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging(req, res, Vtrs, country, condition, 'item.category')
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

router.get("/list/:to_userId/buyer", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'to_userId': req.params.to_userId,
        "item.category": req.query.search
    }
    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging(req, res, Vtrs, country, condition, 'item.category')
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

// //게임판매내역 조회  API
// router.get("/:from_userId/sell", (req, res) => {
//     let country = dbconfig.country;
//     let condition = {
//         'from_userId': req.params.from_userId
//     }
//     let bitwebResponse = new BitwebResponse();
//     Vtrs.list(country, condition)
//     .then(async data => {
//         res.send(200,  data);
//     })
//     .catch(err => {
//         console.error('data error =>', err);
//         bitwebResponse.code = 500;
//         bitwebResponse.message = resErr;
//         res.status(500).send(bitwebResponse.create())
//     })
// });

// //게임구매내역 조회  API
// router.get("/:to_userId/buy", (req, res) => {
//     let country = dbconfig.country;
//     let condition = {
//         'to_userId': req.params.to_userId
//     }
//     let bitwebResponse = new BitwebResponse();
//     Vtrs.list(country, condition)
//     .then(data => {
//         res.send(200,  data);
//         //console.log(data);
//     })
//     .catch(err => {
//         console.error('data error =>', err);
//         bitwebResponse.code = 500;
//         bitwebResponse.message = resErr;
//         res.status(500).send(bitwebResponse.create())
//     })
// });


module.exports = router; 