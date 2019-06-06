let BitwebResponse = require('../../utils/BitwebResponse');
let serviceVtr = require('../service/vtrs');
let util = require('../../utils/util');

function listVtrs(req, res) {
    var bitwebResponse = new BitwebResponse();

    serviceVtr.listVtrs(req)
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

function successTradeStatus(req, res) {
    var bitwebResponse = new BitwebResponse();
    let data = {}
    let vtrId = req.params.vtrId;
    let country = req.body.country;

    serviceVtr.getVtrById(country, vtrId)
        .then((vtr) => {
            if(vtr.buy_status == undefined) {
                data['buy_status'] = true;
                data['completed_buy_date'] = util.formatDate(new Date().toLocaleString('ko-KR'))
            }
            data['sell_status'] = true;
            data['completed_sell_date'] = util.formatDate(new Date().toLocaleString('ko-KR'))
            data['completed'] = true;
            data['completed_date'] = util.formatDate(new Date().toLocaleString('ko-KR'))
            data['confirm_status'] = true;
            data['completed_confirm_date'] = util.formatDate(new Date().toLocaleString('ko-KR'))
            
            serviceVtr.updateVtrs(country, vtrId, data, vtr.buy_status)
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

function cancelTradeStatus(req, res) {
    var bitwebResponse = new BitwebResponse();
    let vtrId = req.params.vtrId;
    let country = req.params.country;

    serviceVtr.deleteVtrs(country, vtrId)
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

exports.listVtrs = listVtrs;
exports.successTradeStatus = successTradeStatus;
exports.cancelTradeStatus = cancelTradeStatus;
