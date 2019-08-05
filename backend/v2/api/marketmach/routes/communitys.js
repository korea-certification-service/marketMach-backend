/**
 * 공통 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-08-01
 */
var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../../utils/BitwebResponse');
let dbconfig = require('../../../../../config/dbconfig');
let utils = require('../../../utils/util');
let logger = require('../../../utils/log');
let serviceCommunity = require('../../../service/communitys');
let serviceReplys = require('../../../service/replys');
let tokens = require('../../../utils/token');

//커뮤니티 목록 조회 API
router.post('/list', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let body = req.body.param;
    let option = req.body.option;
    
    if(req.body.param.country == "KR") {
        body['country'] = {$exists:false};
    }

    let country = dbconfig.country;

    serviceCommunity.count(country, body, option)
    .then(count => {
        serviceCommunity.list(country, body, option)
        .then(communitys => {
            bitwebResponse.code = 200;
            let resData = {
                "successYn":"Y",
                "count": count,
                "list": communitys
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, resData);
            bitwebResponse.data = resData
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
            console.error('get community list error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
                
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('get community count error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//커뮤니티 상세조회 API
router.get('/detail/:communityId', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let body = {"_id":req.params.communityId};
    let country = dbconfig.country;
    let option = {
        "pageIdx": 0,
        "perPage": 100
    }

    serviceCommunity.detail(country, body)
    .then(community => {
        serviceReplys.count(country, {}, option)
        .then(replyCount => {
            serviceReplys.list(country, {}, option)
            .then(replys => {
                bitwebResponse.code = 200;
                community._doc['successYn'] = "Y";
                community._doc['replyCount'] = replyCount;
                community._doc['reply'] = replys;
                let resData = {
                    "detail": community
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, resData);
                bitwebResponse.data = community;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
                console.error('get community reply list error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, req.body, err);
                    
                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
            console.error('get community reply count error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
                
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    }).catch((err) => {
        console.error('get community list error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//커뮤니티 등록 API
router.post('/', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let body = req.body;
    if(req.body.country == "KR") {
        delete body.country;
    }
    let country = dbconfig.country;

    serviceCommunity.add(country, body)
    .then(community => {
        bitwebResponse.code = 200;
        community._doc['successYn'] = "Y";
        let resData = {
            "addCommunity": community
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = community;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('add community error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//커뮤니티 수정 API
router.put('/:communityId', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let condition = {"_id":req.params.communityId};
    let body = req.body;
    if(req.body.country == "KR") {
        delete body.country;
    }
    let country = dbconfig.country;

    serviceCommunity.modify(country, condition, body)
    .then(community => {
        bitwebResponse.code = 200;
        community._doc['successYn'] = "Y";
        let resData = {
            "modifyCommunity": community
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = community;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('modify community error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//커뮤니티 삭제 API
router.delete('/:communityId', tokens.checkInternalToken, function(req, res, next){
    let bitwebResponse = new BitwebResponse();
    let condition = {"_id":req.params.communityId};
    let body = req.body;
    if(req.body.country == "KR") {
        delete body.country;
    }
    let country = dbconfig.country;

    serviceCommunity.remove(country, condition)
    .then(community => {
        bitwebResponse.code = 200;
        community._doc['successYn'] = "Y";
        let resData = {
            "deleteCommunity": community
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = community;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('delete community error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

//파일 업로드 API
router.post('/:communityId/images', tokens.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let condition = {"_id":req.params.communityId};
    let country = dbconfig.country;
    utils.fileUpload(req, res, function() {
        serviceCommunity.modify(country, condition, body)
        .then(community => {
            bitwebResponse.code = 200;
            community._doc['successYn'] = "Y";
            let resData = {
                "modifyCommunity": community
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, resData);
            bitwebResponse.data = community;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
            console.error('modify community error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
                
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    });
});

// 댓글 등록 API
router.post('/reply', tokens.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let data = req.body;
    data['regDate'] = utils.formatDate(new Date().toString());

    serviceReplys.add(country, data)
    .then(result => {
        bitwebResponse.code = 200;
        result._doc['successYn'] = "Y";
        let resData = {
            "addReply": result
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = result;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('add reply error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});


// 댓글 수정 API
router.put('/reply/:replyId', tokens.checkInternalToken, function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let replyId = req.params.replyId;
    let condition = {
        "_id": replyId
    }
    let data = req.body;
    data['regDate'] = utils.formatDate(new Date().toString());

    serviceReplys.modify(country, condition, data)
    .then(result => {
        bitwebResponse.code = 200;
        result._doc['successYn'] = "Y";
        let resData = {
            "modifyReply": result
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = result;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('modify reply error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});


// 댓글 삭제 API
router.delete('/reply/:replyId', tokens.checkInternalToken, function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let replyId = req.params.replyId;
    let condition = {
        "_id": replyId
    }

    serviceReplys.remove(country, condition)
    .then(result => {
        bitwebResponse.code = 200;
        result._doc['successYn'] = "Y";
        let resData = {
            "deleteReply": result
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = result;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('delete community error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router;