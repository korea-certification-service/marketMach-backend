var express = require('express');
var router = express.Router();
var controllerGames = require('../controllers/games')
var BitwebResponse = require('../utils/BitwebResponse')
var controllerCoins = require('../controllers/coins');
var controllerAgreements = require('../controllers/agreements');
var controllerPoints = require('../controllers/points');
var dbconfig = require('../config/dbconfig');
const fs = require('fs');

router.get('/', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;

    controllerGames.getAll(country)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.get('/:gameName', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();

    if (req.params.gameName != null) {

        let game_name = req.params.gameName;
        let country = dbconfig.country;

        controllerGames.getByGameName(country, game_name)
            .then(result => {

                if (result == null) {
                    controllerGames.getByRegexGameName(country, game_name)
                        .then(result => {
                            console.log('games name=>', result)
                            bitwebResponse.code = 200;
                            bitwebResponse.data = result;
                            res.status(200).send(bitwebResponse.create())
                        })
                } else {
                    bitwebResponse.code = 200;
                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create())
                }

            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }

});

router.post('/servers', function (req, res, next) {

    let file = fs.readFileSync('../config/game_list.json', "utf8");
    let data = JSON.parse(file)
    let game_list = []

    for (var i = 0; i < data['data'].length; i++) {

        var gameitem = data['data'][i]
        game_list.push(gameitem);
    }

    console.log("data=>" + data['data'].length)
    console.log("game_list=>", JSON.stringify(game_list))

    var bitwebResponse = new BitwebResponse();
    let country = "KR";

    controllerGames.insertBulk(country, game_list)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result.servers;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
})

router.get('/:gameName/cn', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();

    if (req.params.gameName != null) {

        let game_name = req.params.gameName;
        let country = dbconfig.country;

        controllerGames.getCnByGameName(country, game_name)
            .then(result => {

                if (result == null) {
                    controllerGames.getCnByRegexGameName(country, game_name)
                        .then(result => {
                            console.log('games name=>', result)
                            bitwebResponse.code = 200;
                            bitwebResponse.data = result;
                            res.status(200).send(bitwebResponse.create())
                        })
                } else {
                    bitwebResponse.code = 200;
                    bitwebResponse.data = result;
                    res.status(200).send(bitwebResponse.create())
                }

            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }

});
router.post('/servers/cn', function (req, res, next) {

    let file = fs.readFileSync('../config/game_list_cn.json', "utf8");
    let data = JSON.parse(file)
    let game_list = data['games']
    let country = "CN";

    console.log('data=>', data);


    var bitwebResponse = new BitwebResponse();

    controllerGames.insertBulkCn(country, game_list)
        .then(result => {
            bitwebResponse.code = 200;
            // bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
})

router.put('/:gameId', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    if (req.params.gameId != null) {

        let coins = req.body.coins;
        let agreements = req.body.agreements;
        let points = req.body.points;
        let country = dbconfig.country;

        controllerGames.update(req)
            .then((result) => {

                let resData = result;
                let coinId = result.coinId;
                let agreementId = result.agreementId;
                let pointId = result.pointId;

                controllerCoins.updateById(country, coinId, coins)
                    .then(result => {
                        console.log('coinId=>', coinId)
                        controllerAgreements.updateById(country, agreementId, agreements)
                            .then(result => {
                                controllerPoints.updateById(country, pointId, points)
                                    .then(result => {
                                        resData['address'] = result.address;
                                        console.log('resData=>', resData);
                                        bitwebResponse.code = 200;
                                        bitwebResponse.data = resData;
                                        res.status(200).send(bitwebResponse.create())
                                    })
                            })
                    })
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})

router.delete('/:gameId', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    if (req.params.gameId != null) {
        controllerGames.remove(req)
            .then(result => {
                bitwebResponse.code = 200;
                bitwebResponse.data = result;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
})

module.exports = router;
