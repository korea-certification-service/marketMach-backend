/**
 * banner API
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-26
 */
var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../utils/BitwebResponse');
let dbconfig = require('../../../../config/dbconfig');
let logger = require('../../utils/log');
let tokens = require('../../utils/token');
let util = require('../../utils/util');
let serviceBanner = require('../../service/banner');

router.post('/list', async (req, res) => {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {};

    try {
        let bannerList = await serviceBanner.list(country, condition);
        let resData = {
            "bannerList": bannerList
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = bannerList;                
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('get banners error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    } 
});

router.get('/:bannerId', async (req, res) => {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.bannerId
    };
    
    try {
        let getBanner = await serviceBanner.detail(country, condition);
        let resData = {
            "getBanner": getBanner
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = getBanner;                
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('add banners error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    } 
});

router.post('/add', async (req, res) => {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let reqBody = req.body;
    reqBody["regDate"] =  util.formatDate(new Date().toString());

    try {
        let addBanner = await serviceBanner.add(country, reqBody);
        let resData = {
            "addBanner": addBanner
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqBody, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = addBanner;                
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('add banners error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqBody, err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    } 
});

router.put('/:bannerId', async (req, res) => {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.bannerId
    };
    let reqBody = req.body;
    reqBody["modifyDate"] =  util.formatDate(new Date().toString());

    try {
        let modifyBanner = await serviceBanner.modify(country, condition, reqBody);
        let resData = {
            "modifyBanner": modifyBanner
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqBody, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = modifyBanner;                
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('modify banners error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqBody, err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    } 
});

router.delete('/:bannerId', async (req, res) => {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.bannerId
    };
    
    try {
        let modifyBanner = await serviceBanner.remove(country, condition);
        let resData = {
            "modifyBanner": modifyBanner
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.code = 200;
        bitwebResponse.data = modifyBanner;                
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('modify banners error =>', err);
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);
        let resErr = "처리중 에러 발생";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    } 
});

module.exports = router;