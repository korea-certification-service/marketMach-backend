let BitwebResponse = require('../../utils/BitwebResponse');
let servicePoints = require('../service/points');
let util = require('../../utils/util');

function listPointTrade(req, res) {
    let bitwebResponse = new BitwebResponse();

    servicePoints.listPointTrade(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
}

function listPointHistorys(req, res) {
    let bitwebResponse = new BitwebResponse();
    let country = "KR";
    let name = req.body.name;
    let type = req.body.type;
    let extType = req.body.extType;
    let perPage = req.body.perPage == undefined ? 20 : req.body.perPage;
    let pageIdx = req.body.pageIdx == undefined ? 0 : req.body.pageIdx;
    let option = {
        "perPage": perPage,
        "pageIdx": pageIdx
    }
    let body = {$and: [ {"type": type} ]};
    if(name !== undefined) {
        body['userName'] = name;
    }
    if(extType !== undefined) {
        body['extType'] = extType;
    }

    servicePoints.listPointHistorys(country, body, option)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
}

function updateWithdrawStatus(req, res) {
    let bitwebResponse = new BitwebResponse();
    let pointId = req.params.pointId;
    let country = req.body.country;
    let body = req.body;

    servicePoints.updateWithdrawStatus(country, pointId, body)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create());
    })
}

function successTradeStatus(req, res) {
    var bitwebResponse = new BitwebResponse();
    if (req.params.tradePointId != null) {
        let data = {}
        let tradePointId = req.params.tradePointId;

        servicePoints.getTradePointById(tradePointId)
            .then((tradePoint) => {
                if(tradePoint.buy_status == undefined) {
                    data['buy_status'] = true;
                    data['completed_buy_date'] = util.formatDate(new Date().toLocaleString('ko-KR'))
                }
                data['sell_status'] = true;
                data['completed_sell_date'] = util.formatDate(new Date().toLocaleString('ko-KR'))
                data['completed'] = true;
                data['completed_date'] = util.formatDate(new Date().toLocaleString('ko-KR'))

                servicePoints.updatePointsTrade(tradePointId, data)
                    .then((result) => {
                        let data = {}
                        bitwebResponse.code = 200;
                        bitwebResponse.data = result;
                        res.status(200).send(bitwebResponse.create())
                    }).catch((err) => {
                    console.error('err=>', err)
                    bitwebResponse.code = 500;
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create())
                })
            })
    }
}

function cancelTradeStatus(req, res) {
    var bitwebResponse = new BitwebResponse();
    if (req.params.tradePointId != null) {
        let tradePointId = req.params.tradePointId;

        servicePoints.deletePointsTrade(tradePointId)
            .then((result) => {
                let data = {}
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
}

exports.listPointTrade = listPointTrade;
exports.listPointHistorys = listPointHistorys;
exports.updateWithdrawStatus = updateWithdrawStatus;
exports.successTradeStatus = successTradeStatus;
exports.cancelTradeStatus = cancelTradeStatus;