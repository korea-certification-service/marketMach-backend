var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let serviceCoins = require('../../service/coins');
let serviceUsers = require('../../service/users');
let serviceCoinWithdraws = require('../../service/coinwithdraw');
let logger = require('../../utils/log');
let util = require('../../utils/util');

/*GET Coin List*/
router.get("/list", (req, res) => {
    let condition = {}
    let bitwebResponse = new BitwebResponse();
    serviceCoins.list(condition)
    .then(data => {
        res.send(200, data);
        //console.log(data);
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
        //console.log(data);
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

//특정 유저 coin 출금 lock API
router.get("/lock/:userTag/:value", async (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'userTag': req.params.userTag
    }
    let reqData = {
        'lock': req.params.value
    }
    let bitwebResponse = new BitwebResponse();
    let userInfo = await serviceUsers.detail(country, condition);
    try {
        if(userInfo == null) {
            console.error('data error => no user.');
            let resErr = "there is no data";
            bitwebResponse.code = 500;
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.params, resErr);
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create());
            return;
        }

        let updateCoin = await serviceCoins.modify(country, {"_id":userInfo._doc.coinId}, reqData);
        bitwebResponse.code = 200;
        let resData = {
            "updateCoin": updateCoin
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.params, resData);

        bitwebResponse.data = {
            "successYn":"Y",
            "msg":"lock이 " + req.params.value + "되었습니다."
        };
        res.status(200).send(bitwebResponse.create());
    } catch (err) {
        console.error('data error => ', err);
        let resErr = "error.";
        bitwebResponse.code = 500;
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.params, err);
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create());
        return;
    }
});

//특정 유저 coin 출금 한도 초기화 API
router.get("/coinWithdraw/initalize/:userTag/:coinType", async (req, res) => {
    let country = dbconfig.country;
    let condition = {
        'userTag': req.params.userTag,
        'cryptoCurrencyCode': req.params.coinType,
        "regDate": {"$gte": util.formatDatePerDay(util.formatDate(new Date().toString())), "$lte": util.formatDate(new Date().toString())}
    }
    let bitwebResponse = new BitwebResponse();
    try {
        let deleteCoinWithdraws = serviceCoinWithdraws.removeAll(country, condition);
        bitwebResponse.code = 200;
        let resData = {
            "deleteCoinWithdraw": deleteCoinWithdraws
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.params, resData);

        bitwebResponse.data = {
            "successYn":"Y",
            "msg":req.params.coinType + " 요청횟수를 초기화 하였습니다."
        };
        res.status(200).send(bitwebResponse.create());
    } catch (err) {
        console.error('data error => ', err);
        let resErr = "error.";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create());
        return;
    }
});

module.exports = router;