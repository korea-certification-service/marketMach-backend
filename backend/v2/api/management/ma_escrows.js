var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let serviceEscrows = require('../../service/escrows');


/*GET Coin Detail*/
router.get("/detail/:userId", (req, res) => {
    let condition = {
        '_id': req.param.userId
    }
    console.log("userId =>"+req.param.userId);
    let bitwebResponse = new BitwebResponse();
    serviceEscrows.detail(condition)
    .then(data => {
        res.send(200, data);
        console.log("userId =>"+data);
    })
    .catch(err => {
        console.error('data error =>', err);
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })
});

module.exports = router; 