var express = require('express');
var router = express.Router();
let dbconfig = require('../../../../config/dbconfig');
let BitwebResponse = require('../../utils/BitwebResponse');
let servicePoints = require('../../service/points');


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

module.exports = router; 