/**
 * items API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-28
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var Items = require("../../service/items");

//구매/판매 작성 게시물 조회 API
router.get("/list", (req, res) => {
    let country = dbconfig.country;
    let condition = { }
    let bitwebResponse = new BitwebResponse();
    Items.list(country, condition)
    .then(data => {
        res.status(200).send(data);
    }).catch(err => {
        console.error('data error =>', err);
        let resErr = "escrow 탐색 실패";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

router.get("/:itemId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        '_id': req.params.itemId
    }
    let bitwebResponse = new BitwebResponse();
    Items.detail(country, condition)
    .then(async data => {
        if(data == null) {
            res.status(200).send({_id: "게시물이 삭제됨", title: "게시물이 삭제됨", status: "게시물이 삭제됨"});
        } else {
            res.status(200).send(data);
        } 
    }).catch(err => {
        console.error('data error =>', err);
        let resErr = "escrow 탐색 실패";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router; 