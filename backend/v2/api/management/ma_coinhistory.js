/**
 * coin history API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-16
 */
var express = require('express');
var router = express.Router();
var BitwebResponse = require('../../utils/BitwebResponse');
var coinHistorys = require('../../model/coinHistorys');
let pagination = require('../../service/_pagination');
let db = require('../../utils/db');
let dbconfig = require('../../../../config/dbconfig');

//coin history 조회 API
router.get("/list/:coinId", (req, res) => {

    let bitwebResponse = new BitwebResponse();

    console.log(req.query);
    db.connectDB()
    .then(() => {
        coinHistorys.countDocuments({'coinId': req.params.coinId})
        .where('category').regex(req.query.search || '')
        .then(count => {
            total = count
            coinHistorys.find({'coinId': req.params.coinId})
            .where('category').regex(req.query.search || '')
            .sort({'regDate':-1})
            .skip(parseInt(req.query.skip))
            .limit(parseInt(req.query.limit))
            .exec((err, rs) => {
                if (err) {
                    console.error({ success: false, msg: err });
                    bitwebResponse.code = 500;
                    bitwebResponse.message = resErr;
                    res.status(500).send(bitwebResponse.create())
                }
                res.status(200).send(({ success: true, t: total, ds: rs}));
            })
        });
    })
    

    // pagination.paging({
    //     model: coinHistorys,
    //     country: dbconfig.country,
    //     condition: {'coinId': req.params.coinId},
    //     limit: req.query.limit,
    //     skip: req.query.skip,
    //     search: {'category': req.query.search}
    // })
    // .then(data => {
    //     console.log(data);
    //     res.status(200).send(data);
    // })
    // .catch(err => {
    //     console.error('data error =>', err);
    //     let resErr = "there is no data";
    //     bitwebResponse.code = 500;
    //     bitwebResponse.message = resErr;
    //     res.status(500).send(bitwebResponse.create())
    // })

});

module.exports = router; 