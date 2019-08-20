var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let serviceUsers = require('../../service/users');

/*GET User List*/
router.get("/list", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'country': country
    }
    let bitwebResponse = new BitwebResponse();
    serviceUsers.list(country, condition)
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

/*GET User Count*/
router.get("/count", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'country': country
    }
    let bitwebResponse = new BitwebResponse();
    serviceUsers.count(country, condition)
    .then(data => {
        res.send(200, data);
        console.log(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

/*GET User Detail*/
router.get("/:userId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'country': country,
        '_id': req.params.userId
    }
    let bitwebResponse = new BitwebResponse();
    serviceUsers.detail(country, condition)
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

module.exports = router; 