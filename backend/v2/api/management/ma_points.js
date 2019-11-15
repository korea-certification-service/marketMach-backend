var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let servicePoints = require('../../service/points');
let servicePointTrades = require('../../service/pointTrades');
let serviceVtrTemps = require('../../service/vtrTemps');
let logger = require('../../utils/log');
let token = require('../../utils/token');

/*GET Points Detail*/
router.get("/detail/:pointId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        '_id': req.params.pointId
    }
    let bitwebResponse = new BitwebResponse();
    servicePoints.detail(country, condition)
    .then(data => {
        res.send(200, data);
        //console.log(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

/*PUT Point Modify */
router.put("/modify/:pointId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        '_id': req.params.pointId
    }
    let data = req.body;

    let bitwebResponse = new BitwebResponse();
    servicePoints.modify(country, condition, data)
    .then(success => {
        res.send(200, success);
        //console.log(success);
    })
    .catch(err => {
        console.error('data error =>', err);
        let resErr = "there is no data";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

router.post("/list/all", token.checkInternalToken, async (req, res) => {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = req.body.param;
    if(req.body.param.country == "KR") {
        condition['$or'] = [{country:{$exists:false}},{country:"KR"}];        
    }    
    let option = req.body.option;

    try {
        let count = await servicePointTrades.count(country, condition, option);
        let list = await servicePointTrades.list(country, condition, option);

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