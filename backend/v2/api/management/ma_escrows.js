var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let serviceEscrows = require('../../service/escrows');

/*GET Escrow Detail*/
//입금예정 Escrow
router.get("/detail/:userId/seller", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'sellerUser': req.params.userId
    }
    let bitwebResponse = new BitwebResponse();
    serviceEscrows.list(country, condition)
    .then(data => {
        console.log(data);
        res.status(200).send(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});
//출금예정 Escrow
router.get("/detail/:userId/buyer", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'buyerUser': req.params.userId
    }
    let bitwebResponse = new BitwebResponse();
    serviceEscrows.list(country, condition)
    .then(data => {
        console.log(data);
        res.status(200).send(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router; 