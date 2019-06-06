var express = require('express');
var router = express.Router();
var controllerCategories = require('../controllers/categories')
var BitwebResponse = require('../utils/BitwebResponse')
var dbconfig = require('../config/dbconfig');

router.get('/', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;

    controllerCategories.getAll(country)
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

router.get('/:category1', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();

    if (req.params.category1 != null) {

        let category1 = req.params.category1;
        let country = dbconfig.country;

        controllerCategories.getByCategory1(country, category1)
            .then(result => {

                if (result == null) {
                    controllerCategories.getByRegexCategory1(country, category1)
                        .then(result => {
                            console.log('category1 =>', result)
                            bitwebResponse.code = 200;
                            bitwebResponse.data = result;
                            res.status(200).send(bitwebResponse.create())
                        })
                } else {
                    bitwebResponse.code = 200;
                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create())
                }

            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }

});

module.exports = router;
