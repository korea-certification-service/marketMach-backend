var BitwebResponse = require('../../utils/BitwebResponse');
var serviceBusinessContact = require('../service/businessContact');

function addBusinessContact(req, res) {
    let sampleJson =
        {
            "userTag": "superuser",
            "password": "superuser123",
            "email": "admin@diablab.com",
            "phone": "010-3813-4024"
        }
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();
    serviceBusinessContact.create(country, req)
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

function listBusinessContacts(req, res) {
    var bitwebResponse = new BitwebResponse();

    serviceBusinessContact.listBusinessContacts(req)
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

function getBusinessContact(req, res) {
    let country = req.params.country;
    let businessContactId = req.params.businessContactId;
    var bitwebResponse = new BitwebResponse();

    if (businessContactId != null) {
        serviceBusinessContact.getById(country, businessContactId)
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

function modifyBusinessContact(req, res) {
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();

    serviceBusinessContact.update(country, req)
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
function removeBusinessContact(req, res) {
    let country = req.params.country;
    var bitwebResponse = new BitwebResponse();

    serviceBusinessContact.remove(country, req)
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

exports.addBusinessContact = addBusinessContact;
exports.listBusinessContacts = listBusinessContacts;
exports.getBusinessContact = getBusinessContact;
exports.modifyBusinessContact = modifyBusinessContact;
exports.removeBusinessContact = removeBusinessContact;