var BitwebResponse = require('../../utils/BitwebResponse');
var servicePersonal = require('../service/personal');

function listPersonal(req, res) {
    var bitwebResponse = new BitwebResponse();

    servicePersonal.listPersonal(req)
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

function getPersonal(req, res) {
    let country = req.params.country;
    let personalId = req.params.personalId;
    var bitwebResponse = new BitwebResponse();

    if (personalId != null) {
        servicePersonal.getById(country, personalId)
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
}

function modifyPersonal(req, res) {
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();

    servicePersonal.update(country, req)
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

exports.listPersonal = listPersonal;
exports.getPersonal = getPersonal;
exports.modifyPersonal = modifyPersonal;