var express = require('express');
var router = express.Router();
let request = require('request');
let Ont = require('ontology-ts-sdk');
let BitwebResponse = require('../../utils/BitwebResponse')
let dbconfig = require('../../../../config/dbconfig');
let util = require('../../utils/util');
let token = require('../../utils/token');
let serviceitems = require('../../service/items');
let serviceUsers = require('../../service/users');
let logger = require('../../utils/log');

//아이템 댓글 목록 조회 API
router.post('/item/reply/list', token.checkInternalToken, async function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = req.body.param;

    try {
        let itemReplys = await serviceitems.getReplys(country, condition);
        let resultData = [];
        for(var i in itemReplys) {
            let user = await serviceUsers.detail(country, {"userTag":itemReplys[i]._doc.reporter});
            let item = await serviceitems.detail(country, {"_id":itemReplys[i]._doc.itemId});
            resultData.push({
                "_사용자ID":itemReplys[i]._doc.reporter,
                "_UserName":user._doc.userName,
                "_Mobile": user._doc.phone,
                "_댓글내용": itemReplys[i]._doc.content,
                "_댓글입력일시": itemReplys[i]._doc.regDate,
                "_사이트": item._doc.country == undefined ? "한국" : "포인트몰",
                "_상품분류": item._doc.category,
                "_상품제목": item._doc.title,
                "_거래현황": util.getStatus(item._doc.status).text,
                "_가격": item._doc.country == undefined ? item._doc.price + " " + item._doc.cryptoCurrencyCode : item._doc.point + " POINT",
                "_게시자ID": item._doc.userTag,
                "_상품등록일시": item._doc.regDate
            })
        }

        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "resultData": resultData
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);

        bitwebResponse.data = resultData;
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('get item reply error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

//아이템 목록 조회 API
router.post('/item/list', token.checkInternalToken, async function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = req.body.param;
    let option = req.body.option;

    try {
        let items = await serviceitems.list(country, condition, option);
        let resultData = [];
        for(var i in items) {
            let user = await serviceUsers.detail(country, {"userTag":items[i]._doc.userTag});
            resultData.push({
                "_사용자ID":items[i]._doc.userTag,
                "_UserName":user._doc.userName,
                "_Mobile": user._doc.phone,
                "_사이트": items[i]._doc.country == undefined ? "한국" : "포인트몰",
                "_상품분류": items[i]._doc.category,
                "_상품제목": items[i]._doc.title,
                "_거래현황": util.getStatus(items[i]._doc.status).text,
                "_가격": items[i]._doc.country == undefined ? items[i]._doc.price + " " + items[i]._doc.cryptoCurrencyCode : items[i]._doc.point + " POINT",
                "_상품등록일시": items[i]._doc.regDate
            })
        }

        bitwebResponse.code = 200;
        let resData = {
            "successYn": "Y",
            "resultData": resultData
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);

        bitwebResponse.data = resultData;
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('get item reply error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
});

module.exports = router;