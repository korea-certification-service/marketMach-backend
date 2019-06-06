var BitwebResponse = require('../../utils/BitwebResponse');
var serviceFaq = require('../service/faq');

function addFaq(req, res) {
    let sampleJson =
        {
            "userTag": "superuser",
            "password": "superuser123",
            "email": "admin@diablab.com",
            "phone": "010-3813-4024"
        }
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();
    serviceFaq.create(country, req)
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

function listFaqs(req, res) {
    var bitwebResponse = new BitwebResponse();

    serviceFaq.listFaqs(req)
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

function getFaq(req, res) {
    let country = req.params.country;
    let faqId = req.params.faqId;
    var bitwebResponse = new BitwebResponse();

    if (faqId != null) {
        serviceFaq.getById(country, faqId)
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

function modifyFaq(req, res) {
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();

    serviceFaq.update(country, req)
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
function removeFaq(req, res) {
    let country = req.params.country;
    var bitwebResponse = new BitwebResponse();

    serviceFaq.remove(country, req)
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

exports.addFaq = addFaq;
exports.listFaqs = listFaqs;
exports.getFaq = getFaq;
exports.modifyFaq = modifyFaq;
exports.removeFaq = removeFaq;