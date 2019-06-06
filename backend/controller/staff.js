var BitwebResponse = require('../../utils/BitwebResponse');
var serviceStaff = require('../service/staff');


function login(req, res) {
    if (req.body.userTag != null && req.body.password != null) {

        let userTag = req.body.userTag;
        let crypto = require('crypto');
        let password = crypto.createHash('sha256').update(req.body.password).digest('base64');
        let data = {}
        let country = "KR";

        data['userTag'] = userTag;
        data['password'] = password;
        console.log('data=>', data)

        var bitwebResponse = new BitwebResponse();
        serviceStaff.getStaff(country, data)
            .then(result => {

                req.session.userTag = result.userTag;
                req.session.userName = result.userName;
                req.session.userId = result._id;
                req.session.active = result.active;

                let resData = {"userTag": result.userTag, "userId": result._id, "active": result.active}
                bitwebResponse.code = 200;
                bitwebResponse.data = resData;
                res.status(200).send(bitwebResponse.create())
            }).catch((err) => {
            console.error('err=>', err)

            let resErr = "Incorrect ID or password";
            bitwebResponse.code = 403;
            bitwebResponse.message = resErr;
            res.status(403).send(bitwebResponse.create())
        })
    }
}

function addStaff(req, res) {
    let sampleJson =
        {
            "userTag": "superuser",
            "password": "superuser123",
            "email": "admin@diablab.com",
            "phone": "010-3813-4024"
        }
    let country = "KR";
    var bitwebResponse = new BitwebResponse();
    if (req.body.userTag != null) {
        serviceStaff.getByStaffTagAndEmail(country, req.body.userTag, req.body.email)
            .then(result=> {

                if (result != null) {
                    let error = "userTag 혹은 userEmail에 이미 사용중입니다.";
                    bitwebResponse.code = 403;
                    bitwebResponse.message = error;
                    res.status(403).send(bitwebResponse.create())
                } else {
                    serviceStaff.createWithIds(country, req)
                        .then(result => {

                            req.session.userTag = result.userTag;
                            req.session.userId = result._id;
                            req.session.active = false;

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

            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
}

function listStaffs(req, res) {
    var bitwebResponse = new BitwebResponse();

    serviceStaff.listStaffs()
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

function getStaff(req, res) {
    let country = "KR";
    var bitwebResponse = new BitwebResponse();

    if (req.params.staffId != null) {
        serviceStaff.get(country, req)
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

function modifyStaff(req, res) {
    let country = "KR";
    var bitwebResponse = new BitwebResponse();

    serviceStaff.update(country, req)
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
function removeStaff(req, res) {
    let country = "KR";
    var bitwebResponse = new BitwebResponse();

    serviceStaff.remove(country, req)
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


exports.login = login;
exports.addStaff = addStaff;
exports.listStaffs = listStaffs;
exports.getStaff = getStaff;
exports.modifyStaff = modifyStaff;
exports.removeStaff = removeStaff;