var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../utils/BitwebResponse');
let BlackUsers = require('../../model/blacklist');
let blacklist = require('../../service/blacklist');
let pagination = require('../../service/_pagination');
let dbconfig = require('../../../../config/dbconfig');

/*GET User List*/
router.get("/list", (req, res) => {

    let bitwebResponse = new BitwebResponse();

    console.log(req.query);

    pagination.paging({
        model: BlackUsers,
        condition: {},
        limit: req.query.limit,
        skip: req.query.skip,
        search: { key: req.query.key, val: req.query.val }
    })
    .then(data => {
        res.status(200).send(data);
    })
    .catch(err => {
        console.error('data error =>', err);
        let resErr = "there is no data";
        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    })

});

/*GET User Count*/
router.get("/count/:userTag", (req, res) => {
    let country = dbconfig.country;
    let bitwebResponse = new BitwebResponse();
    let condition = {
        "recommander": req.params.userTag
    }
    blacklist.count(country, condition)
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

/*GET User Detail*/
router.get("/:userId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        '_id': req.params.userId
    }
    let bitwebResponse = new BitwebResponse();
    blacklist.detail(country, condition)
    .then(data => {
        if(data == null) {
            res.send(200, []);
        } else {
            res.send(200, data);
        }
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

/*PUT User Modify*/
router.put("/modify/:userId", (req, res) => {
    let country = dbconfig.country;
    let condition = {
        '_id': req.params.userId
    }
    let data = req.body;

    let bitwebResponse = new BitwebResponse();
    blacklist.modify(country, condition, data)
    .then(success => {
        //console.log(success);
        res.status(200).send(success);
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