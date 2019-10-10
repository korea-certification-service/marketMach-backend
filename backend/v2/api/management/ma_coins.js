var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let serviceCoins = require('../../service/coins');
let serviceCoinsBak = require('../../service/coinsbak');
let serviceUsers = require('../../service/users');
let serviceCoinWithdraws = require('../../service/coinwithdraw');
let serviceCoinHistorys = require('../../service/coinHistorys');
let logger = require('../../utils/log');
let util = require('../../utils/util');
let token = require('../../utils/token');

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

//coin swap 시 10% api 기능 추가
router.post("/swap", token.checkInternalToken, async (req, res) => {
    let country = dbconfig.country;
    let bitwebResponse = new BitwebResponse();
    let bonusRate = req.body.bonusRate == undefined ? 0 : req.body.bonusRate;
    try {
        let getUsers = await serviceUsers.list(country, {}, false);
        for(var i in getUsers) {
            let getCoinInfo = await serviceCoins.detail(country, {"_id":getUsers[i]._doc.coinId});
            let total_mach = getCoinInfo._doc.total_mach == undefined ? 0 : getCoinInfo._doc.total_mach;
            let bonus = parseFloat((total_mach * bonusRate).toFixed(8));
            let updateMach = parseFloat((total_mach + bonus).toFixed(8));            
            let data = {
                "extType":"mach",
                "coinId": getUsers[i]._doc.coinId,
                "category": 'deposit',          
                "status": "success",
                "currencyCode": "MACH",
                "amount": updateMach,
                "price": updateMach,
                "regDate": util.formatDate(new Date().toString())
            }
            let addCoinHistory = await serviceCoinHistorys.add(country, data);
            let updateData = {"total_mach": updateMach};
            let updatedCoin = await serviceCoins.modify(country, {"_id":getUsers[i]._doc.coinId}, updateData);
            let resData = {
                "addCoinHistory": addCoinHistory,
                "updatedCoin": updatedCoin
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, resData);
        }
        bitwebResponse.code = 200;
        bitwebResponse.data = {
            "successYn":"Y",
            "msg": getUsers.length + "건 처리완료."
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

//coin backup api 기능 추가
router.post("/backup", token.checkInternalToken, async (req, res) => {
    let country = dbconfig.country;
    let bitwebResponse = new BitwebResponse();
    try {
        let getCoins = await serviceCoins.list(country, {});
        for(var i in getCoins) {
            let assignData = Object.assign({},getCoins[i]._doc);
            assignData['coinId'] = assignData._id;
            delete assignData._id;
            delete getCoins[i]._doc['_id'];
            let addUserBackup = await serviceCoinsBak.add(country, assignData);
            let resData = {
                "addUserBackup": addUserBackup
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, resData);
        }
        bitwebResponse.code = 200;
        bitwebResponse.data = {
            "successYn":"Y",
            "msg": getCoins.length + "건 처리완료."
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