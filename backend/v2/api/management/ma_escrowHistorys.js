/**
 * escrowHistory API
 * 작성자 : Jini Seo
 * 작성일 : 2019-08-19
 */
var express = require('express');
var router = express.Router();
var dbconfig = require('../../../../config/dbconfig');
var BitwebResponse = require('../../utils/BitwebResponse');
var ServiceItems = require('../../service/items');
var EscrowHistorys = require('../../service/escrowHistorys');

//escrow history 조회 API
router.get("/:userTag", (req, res) => {
    let resArray = [];
    let country = dbconfig.country;
    let condition = {
        'userTag': req.params.userTag
    }
    let bitwebResponse = new BitwebResponse();
    ServiceItems.list(country, condition)
    .then(items => {

        if(items.length == 0) {
            res.status(200).send([]);
        } else {
            for (let i = 0; i < items.length; i++) {

                EscrowHistorys.detail(country, {'itemId': items[i]._id})
                .then(data => {
                    if(data != null) resArray.push(data)
                    if( i == items.length - 1 )res.status(200).send(resArray);
                }) 
    
            }
        }
        
    })
    .catch(err => {
        console.error('data error =>', err);
        let resErr = "Items 탐색 실패";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
    console.log(req.params);
});

module.exports = router; 

function newFunction(items) {
    return items.length - 1;
}
