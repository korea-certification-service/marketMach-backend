var express = require('express');
var router = express.Router();
var controllerVtrs = require('../controllers/vtrs');
var util = require('../utils/util');
var dbconfig = require('../config/dbconfig');
var BitwebResponse = require('../utils/BitwebResponse')

router.post('/vtrs/completedSell/list', function (req, res, next) {
    let country = dbconfig.country;
    let sellCompleted = (req.body.sellCompleted == undefined ? util.formatDate(new Date()) : req.body.sellCompleted);
    let startSellCompleted =  new Date(sellCompleted);
    let toDate = sellCompleted;
    let fromDate = util.formatDate(startSellCompleted.setDate(startSellCompleted.getDate() - 7));
    let body = {
        "sell_status": true,
        "completed": {$exists: false},
        "completed_sell_date": {"$gte": fromDate,"$lte": toDate}
    };

    var bitwebResponse = new BitwebResponse();

    controllerVtrs.getVtrs(country, body)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            let jsonResult = bitwebResponse.create();
            res.status(200).send(jsonResult)
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })

});

module.exports = router;
