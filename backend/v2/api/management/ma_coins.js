var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let serviceCoins = require('../../service/coins');

/*GET Coin List*/
router.get("/list", (req, res) => {
    let condition = { }
    let bitwebResponse = new BitwebResponse();
    serviceCoins.list(condition)
    .then(data => {
        res.send(200, data);
        console.log(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        let resErr = "there is no data";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

/*GET Coin Detail*/
router.get("/detail/:coinId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        '_id': req.params.coinId
    }
    let bitwebResponse = new BitwebResponse();
    serviceCoins.detail(country, condition)
    .then(data => {
        res.send(200, data);
        console.log(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        let resErr = "there is no data";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

/*PUT Coin Modify */
router.put("/modify/:coinId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        '_id': req.params.coinId
    }
    let data = req.body;

    let bitwebResponse = new BitwebResponse();
    serviceCoins.modify(country, condition, data)
    .then(success => {
        res.send(200, success);
        console.log(success);
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