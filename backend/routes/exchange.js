let express = require('express');
let router = express.Router();
let dbconfig = require('../config/dbconfig');
let exchangeController = require('../controllers/exchange');
let coinHistoryController = require('../controllers/coinHistorys');
let pointHistoryController = require('../controllers/pointHistorys');
var BitwebResponse = require('../utils/BitwebResponse');

//point -> mach 교환(mach 입금)
router.post('/deposit', function (req, res, next) {
    let country = dbconfig.country;
    let data = req.body;
    let bitwebResponse = new BitwebResponse();
    exchangeController.deposit(country, data) 
        .then(deposit => {
            bitwebResponse.code = 200;
            bitwebResponse.data = deposit;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
});

//mach -> point 교환(mach 출금)
router.post('/withdraw', function (req, res, next) {
    let country = dbconfig.country;
    let data = req.body;
    let bitwebResponse = new BitwebResponse();
    exchangeController.withdraw(country, data) 
        .then(withdraw => {
            bitwebResponse.code = 200;
            bitwebResponse.data = withdraw;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
});

router.get('/history/:coinId/:exchangeType', function(req, res, next){
    let country = dbconfig.country;
    let exchangeType = req.params.exchangeType;
    let coinId = req.params.coinId;
    let data = {
        "coinId": coinId,
        "category": "exchange-" + exchangeType
    }
    let option = {
        "perPage": req.query.perPage == undefined ? 20 : parseInt(req.query.perPage),
        "pageIdx": req.query.pageIdx == undefined ? 0 : parseInt(req.query.pageIdx)
    };
    let bitwebResponse = new BitwebResponse();

    coinHistoryController.getCoinHistorys(country, data, option)
        .then(coinHistorys => {
            bitwebResponse.code = 200;
            bitwebResponse.data = coinHistorys;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
});

module.exports = router;