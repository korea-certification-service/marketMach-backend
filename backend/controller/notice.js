var BitwebResponse = require('../../utils/BitwebResponse');
var serviceNotice = require('../service/notice');

function addNotice(req, res) {
    let sampleJson =
        {
            "userTag": "superuser",
            "password": "superuser123",
            "email": "admin@diablab.com",
            "phone": "010-3813-4024"
        }
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();
    serviceNotice.create(country, req)
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

function listNotices(req, res) {
    var bitwebResponse = new BitwebResponse();

    serviceNotice.listNotices(req)
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

function getNotice(req, res) {
    let country = req.params.country;
    let noticeId = req.params.noticeId;
    var bitwebResponse = new BitwebResponse();

    if (noticeId != null) {
        serviceNotice.getById(country, noticeId)
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

function modifyNotice(req, res) {
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();

    serviceNotice.update(country, req)
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
function removeNotice(req, res) {
    let country = req.params.country;
    var bitwebResponse = new BitwebResponse();

    serviceNotice.remove(country, req)
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

exports.addNotice = addNotice;
exports.listNotices = listNotices;
exports.getNotice = getNotice;
exports.modifyNotice = modifyNotice;
exports.removeNotice = removeNotice;