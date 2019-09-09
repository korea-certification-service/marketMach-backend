/**
 * 사용자 API
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-24
 */
var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let logger = require('../../../utils/log');
let token = require('../../../utils/token');
let BitwebResponse = require('../../../utils/BitwebResponse')
let serviceItems = require('../../../service/items');

//아이템 목록 조회 API
router.get('/', token.checkInternalToken, function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = req.query;
    if(country != "KR") {
        condition['country'] = country;
    }
    let status = req.query.status;
    if(status != undefined) {
        if(status == "1") {
            status = [1,2,3];
        } else if (status == "4") {
            status = [4,5,6,7];
        } else if (status == "0") {
            status = [0];
        } else if(status == "101") {
            status = [101,102,103];
        } else if (status == "104") {
            status = [104,105,106,107];
        }
        condition['status'] = status;
    }
    let option = {
        'pageIdx': req.query.pageIdx,
        'perPage': req.query.perPage
    }

    serviceItems.count(country, condition, option)
    .then(count => {
        serviceItems.list(country, condition, option)
        .then(list => {
            bitwebResponse.code = 200;
            let resData = {
                "successYn": "Y",
                "count": count,
                "list": list
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, resData);
            bitwebResponse.data = resData;

            let jsonResult = bitwebResponse.create();

            if (option.pageIdx != undefined) option.pageIdx = pageIdx ? option.pageIdx : 0
            if (option.perPage != undefined) option.perPage = perPage ? option.perPage : 10

            jsonResult['pageIdx'] = option.pageIdx;
            jsonResult['perPage'] = option.perPage;

            res.status(200).send(jsonResult);
        }).catch((err) => {
            console.error('list item error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, condition, err);
    
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        }) 
    }).catch((err) => {
        console.error('count item error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
});

//아이템 상세조회 API
router.get('/:itemId', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let itemId = req.params.itemId;
    let country = dbconfig.country;
    let conditionItem = {
        "_id": itemId
    }
    
    serviceItems.detail(country, conditionItem)
    .then((item) => {    
        bitwebResponse.code = 200;
        let resData = {
            "item": item
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, itemId, resData);

        bitwebResponse.data = item;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('get item error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, itemId, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
});

//아이템 등록 API
router.post('/', token.checkInternalToken, function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let reqData = {}
    reqData = req.body;
    if(country != "KR") {
        reqData['country'] = country;
    }
    reqData['total_price'] = req.body.price;
    reqData['total_point'] = req.body.point;
    reqData['regDate'] = util.formatDate(new Date().toString())

    // ATS 기능 구현 추가
    // request({
    //     uri: "https://www.googleapis.com/language/translate/v2?key=AIzaSyCh4pRdojrMcG6xeuG6ufB7hDRLpKRzP3g",
    //     method: "POST",
    //     qs: {
    //         target: 'en',
    //         format: 'html',
    //         q: input_text
    //     },
    // }).then(title => {
    //     req.body['title_en'] = JSON.parse(title).data.translations[0].translatedText;
    //     input_text = req.body.desc;

    //     request({
    //         uri: "https://www.googleapis.com/language/translate/v2?key=AIzaSyCh4pRdojrMcG6xeuG6ufB7hDRLpKRzP3g",
    //         method: "POST",
    //         qs: {
    //             target: 'en',
    //             format: 'html',
    //             q: input_text
    //         },
    //     }).then(desc => {
    //         req.body['desc_en'] = JSON.parse(desc).data.translations[0].translatedText;

            serviceItems.add(country, reqData)
            .then(addItem => {
                bitwebResponse.code = 200;
                addItem._doc["successYn"] = "Y";
                let resData = {
                    "addItem": addItem
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, reqData, resData);

                bitwebResponse.data = addItem;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
                console.error('add item error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, reqData, err);

                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            }) 
    //   });
    // });
});

//아이템 수정 API
router.post('/:itemId', token.checkInternalToken, function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.itemId
    }
    let reqData = {}
    reqData = req.body;
    reqData['total_price'] = req.body.price;
    reqData['total_point'] = req.body.point;
    reqData['modifyDate'] = util.formatDate(new Date().toString())

    // ATS 기능 구현 추가
    // request({
    //     uri: "https://www.googleapis.com/language/translate/v2?key=AIzaSyCh4pRdojrMcG6xeuG6ufB7hDRLpKRzP3g",
    //     method: "POST",
    //     qs: {
    //         target: 'en',
    //         format: 'html',
    //         q: input_text
    //     },
    // }).then(title => {
    //     req.body['title_en'] = JSON.parse(title).data.translations[0].translatedText;
    //     input_text = req.body.desc;

    //     request({
    //         uri: "https://www.googleapis.com/language/translate/v2?key=AIzaSyCh4pRdojrMcG6xeuG6ufB7hDRLpKRzP3g",
    //         method: "POST",
    //         qs: {
    //             target: 'en',
    //             format: 'html',
    //             q: input_text
    //         },
    //     }).then(desc => {
    //         req.body['desc_en'] = JSON.parse(desc).data.translations[0].translatedText;

            serviceItems.modify(country, condition, reqData)
            .then(modifyItem => {
                bitwebResponse.code = 200;
                modifyItem._doc["successYn"] = "Y";
                let resData = {
                    "modifyItem": modifyItem
                }
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, reqData, resData);

                bitwebResponse.data = modifyItem;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
                console.error('add item error =>', err);
                let resErr = "처리중 에러 발생";
                //API 처리 결과 별도 LOG로 남김
                logger.addLog(country, req.originalUrl, reqData, err);

                bitwebResponse.code = 500;
                bitwebResponse.message = resErr;
                res.status(500).send(bitwebResponse.create())
            }) 
    //     });
    // });
});

//아이템 삭제 API
router.delete('/:itemId', token.checkInternalToken, function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.itemId
    }
    
    serviceItems.remove(country, condition)
    .then(deleteItem => {
        bitwebResponse.code = 200;
        deleteItem._doc["successYn"] = "Y";
        let resData = {
            "deleteItem": deleteItem
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);

        bitwebResponse.data = deleteItem;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('add item error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }) 
});

//파일 업로드 API
router.post('/:itemId/images', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let condition = {"_id":req.params.itemId};
    let country = dbconfig.country;
    utils.fileUpload(req, res, function() {
        serviceItems.modify(country, condition, body)
        .then(updateItem => {
            bitwebResponse.code = 200;
            item._doc['successYn'] = "Y";
            let resData = {
                "updateItem": updateItem
            }
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, resData);
            bitwebResponse.data = updateItem;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
            console.error('modify item upload error =>', err);
            let resErr = "처리중 에러 발생";
            //API 처리 결과 별도 LOG로 남김
            logger.addLog(country, req.originalUrl, req.body, err);
                
            bitwebResponse.code = 500;
            bitwebResponse.message = resErr;
            res.status(500).send(bitwebResponse.create())
        })
    });
});

router.put("/:itemId/clicked", token.checkInternalToken, function(req, res, next) {
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.itemId
    }
    let bitwebResponse = new BitwebResponse();
    let reqData = {
        "clicked": {$inc: 1}
    }

    serviceItems.modify(country, condition, reqData)
    .then(updateItem => {
        bitwebResponse.code = 200;
        item._doc['successYn'] = "Y";
        let resData = {
            "updateItem": updateItem
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqData, resData);
        bitwebResponse.data = updateItem;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('modify item clicked error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqData, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

router.post('/reply', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let reqData = req.body;
    reqData["regDate"] = util.formatDate(new Date().toString());

    controllerItems.addReply(country, reqData)
    .then(addReply => {
        bitwebResponse.code = 200;
        addReply._doc['successYn'] = "Y";
        let resData = {
            "addReply": addReply
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqData, resData);
        bitwebResponse.data = addReply;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('add item reply error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, reqData, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

router.put('/reply/:replyId', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.replyId
    }
    let reqData = req.body;
    reqData["modifyDate"] = util.formatDate(new Date().toString());

    controllerItems.modifyReply(country, condition, reqData)
    .then(modifyReply => {
        bitwebResponse.code = 200;
        modifyReply._doc['successYn'] = "Y";
        let resData = {
            "modifyReply": modifyReply
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        bitwebResponse.data = modifyReply;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('modify item reply error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

router.delete('/reply/:replyId', token.checkInternalToken, function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let condition = {
        "_id": req.params.replyId
    }

    controllerItems.deleteReply(country, condition)
    .then(deleteReply => {
        bitwebResponse.code = 200;
        modifyReply._doc['successYn'] = "Y";
        let resData = {
            "deleteReply": deleteReply
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, resData);
        bitwebResponse.data = deleteReply;
        res.status(200).send(bitwebResponse.create())
    }).catch((err) => {
        console.error('delete item reply error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, condition, err);
            
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router;