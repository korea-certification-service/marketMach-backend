var BitwebResponse = require('../../utils/BitwebResponse');
var serviceCms = require('../service/cms');

function addCms(req, res) {
    let sampleJson =
        {
            "userTag": "superuser",
            "password": "superuser123",
            "email": "admin@diablab.com",
            "phone": "010-3813-4024"
        }
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();
    serviceCms.create(country, req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
}

function listCms(req, res) {
    var bitwebResponse = new BitwebResponse();

    serviceCms.listCms(req)
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

function getCms(req, res) {
    let country = req.params.country;
    let cmsId = req.params.cmsId;
    var bitwebResponse = new BitwebResponse();

    serviceCms.getById(country, cmsId)
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

function modifyCms(req, res) {
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();

    serviceCms.updateById(country, req)
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
function removeCms(req, res) {
    let country = req.params.country;
    var bitwebResponse = new BitwebResponse();

    serviceCms.removeById(country, req)
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

exports.addCms = addCms;
exports.listCms = listCms;
exports.getCms = getCms;
exports.modifyCms = modifyCms;
exports.removeCms = removeCms;