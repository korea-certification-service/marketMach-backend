var express = require('express');
var router = express.Router();
var controllerCountryCodes = require('../controllers/countryCodes');
var BitwebResponse = require('../utils/BitwebResponse');
const dbconfig = require('../config/dbconfig')

router.get('/', function (req, res, next) {
    let country = dbconfig.country;

    var bitwebResponse = new BitwebResponse();
    controllerCountryCodes.get(country)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router;
