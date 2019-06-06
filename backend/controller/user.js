var BitwebResponse = require('../../utils/BitwebResponse');
var serviceUser = require('../service/user');


function listUsers(req, res) {
    let bitwebResponse = new BitwebResponse();

    serviceUser.listUsers(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
}

function updateAuthEmail(req,res) {
    let userId = req.params.userId;
    let country = req.body.country;
    let data = {
        'active': req.body.active
    };
    let bitwebResponse = new BitwebResponse();

    serviceUser.updateAuthEmail(country, userId, data)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create());
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
}

function getUser(req, res) {
    let country = req.params.country;
    var bitwebResponse = new BitwebResponse();

    serviceUser.getUser(country, req.params.userId)
        .then(result => {
            //to-do : 포인트 정보, 암호화폐 정보, 거래 내역 등 항목들 추가
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

function modifyUser(req, res) {
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();

    serviceUser.update(country, req)
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
function removeUser(req, res) {
    let country = req.params.country;
    var bitwebResponse = new BitwebResponse();

    serviceUser.getUser(country, req.params.userId)
        .then(user => {
            let withdrawUser = user._doc;
            serviceUser.createWithdrawUser(country, withdrawUser)
                .then(() => {
                    serviceUser.remove(country, req)
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
                }).catch((err) => {
                console.error('err=>', err)
                bitwebResponse.code = 500;
                bitwebResponse.message = err;
                res.status(500).send(bitwebResponse.create())
            })
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
}

exports.listUsers = listUsers;
exports.updateAuthEmail = updateAuthEmail;
exports.getUser = getUser;
exports.modifyUser = modifyUser;
exports.removeUser = removeUser;