var express = require('express');
var router = express.Router();
var dbconfig = require('../config/dbconfig');
var faqController = require('../controllers/faq');
var BitwebResponse = require('../utils/BitwebResponse')


router.get('/', function (req, res, next) {
    res.render('faq/list', {title: 'Bitweb Main', pageIdx: req.query.pageIdx});
});

router.get('/list', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    faqController.count(req)
        .then(count => {
            faqController.list(req)
                .then(list => {
                    let result = {
                        "count": count,
                        "list": list
                    };
                    bitwebResponse.code = 200;
                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create())
                }).catch((err) => {
                console.error('err=>', err)
                bitwebResponse.code = 500;
                bitwebResponse.message = err;
                res.status(500).send(bitwebResponse.create())
            });
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
});

router.get('/detail', function (req, res, next) {
    res.render('faq/detail', {title: 'Bitweb Main'});
});

router.get('/detail/:faqId', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    if (req.params.faqId != null) {
        faqController.get(req)
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
    }
});

router.post('/', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    faqController.add(req)
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
