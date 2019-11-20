/**
 * 관리자 - VTR 거래 관련 API(현재 사용 안함)
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var Vtrs = require('../../model/vtrs');
let pagination = require('../../service/_pagination');
let serviceVtrTemps = require('../../service/vtrTemps');
let serviceVtrs = require('../../service/vtrs');
let logger = require('../../utils/log');
let token = require('../../utils/token');

router.get("/list/:_id", (req, res) => {

    let condition = {
        $or: [
            {from_userId: req.params._id},
            {to_userId: req.params._id}
        ]
    }

    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging({
        model: Vtrs,
        condition: condition,
        limit: req.query.limit,
        skip: req.query.skip,
        // search: {'item._id': req.query.search }
        search: { key: req.query.key, val: req.query.val }
    })
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

// router.get("/list/:to_userId/buyer", (req, res) => {
//     let country = dbconfig.country;
//     let condition = {
//         'to_userId': req.params.to_userId,
//         "item.category": req.query.search
//     }
//     let bitwebResponse = new BitwebResponse();

//     console.log(req.query);

//     pagination.paging(req, res, Vtrs, country, condition, 'item.category')
//     .then(data => {
//         res.status(200).send(data);
//     })
//     .catch(err => {
//         console.error('data error =>', err);
//         let resErr = "there is no data";
//         bitwebResponse.code = 500;
//         bitwebResponse.message = resErr;
//         res.status(500).send(bitwebResponse.create())
//     })
// });

router.post("/list/all", token.checkInternalToken, async (req, res) => {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = req.body.param;
    if(req.body.param.country == "KR") {
        condition['$or'] = [{country:{$exists:false}},{country:"KR"}];        
    }    
    let option = req.body.option;

    try {
        let count = await serviceVtrs.count(country, condition, option);
        let list = await serviceVtrs.list(country, condition, option);

        for(var i in list) {
            let tempCondition = {
                "item._id": list[i]._doc.item._id
            }
            let tempResult = await serviceVtrTemps.detail(country, tempCondition);
            if(tempResult != null) {
                delete tempResult._doc['item'];                
            }
            list[i]._doc['vtrTemp'] = tempResult;
        }

        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "count": count,
            "list": list
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = resData;

        let jsonResult = bitwebResponse.create();

        jsonResult['pageIdx'] = option.pageIdx;
        jsonResult['perPage'] = option.perPage;

        res.status(200).send(jsonResult);
    } catch(err) {
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
})

module.exports = router; 