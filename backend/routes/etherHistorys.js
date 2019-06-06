var express = require('express');
var router = express.Router();
var controllerEtherHistorys = require('../controllers/etherHistorys')
var DaiosResponse = require('../utils/DaiosResponse')

router.get('/:historyId', function (req, res, next) {

    var daiosResponse = new DaiosResponse();
    if (req.params.historyId != null) {
        controllerEtherHistorys.get(req)
            .then(result => {
                daiosResponse.code = 200;
                daiosResponse.data = result;
                res.status(200).send(daiosResponse.create())
            }).catch((err) => {
            console.error('err=>', err)
            daiosResponse.code = 500;
            daiosResponse.message = err;
            res.status(500).send(daiosResponse.create())
        })
    }

});

router.post('/', function (req, res, next) {

    var daiosResponse = new DaiosResponse();
    if (req.body.historyId != null) {
        controllerEtherHistorys.create(req)
            .then(result => {
                daiosResponse.code = 200;
                daiosResponse.data = result;
                res.status(200).send(daiosResponse.create())
            }).catch((err) => {
            console.error('err=>', err)
            daiosResponse.code = 500;
            daiosResponse.message = err;
            res.status(500).send(daiosResponse.create())
        })
    }
})

module.exports = router;
