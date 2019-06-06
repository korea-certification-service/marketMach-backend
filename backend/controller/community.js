var BitwebResponse = require('../../utils/BitwebResponse');
var serviceCommunity = require('../service/community');
let awsS3 = require('../../utils/awsS3');
var util = require('../../utils/util');

function addCommunity(req, res) {
    let sampleJson =
        {
            "userTag": "superuser",
            "password": "superuser123",
            "email": "admin@diablab.com",
            "phone": "010-3813-4024"
        }
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();
    serviceCommunity.create(country, req)
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

function listCommunitys(req, res) {
    var bitwebResponse = new BitwebResponse();

    serviceCommunity.listCommunitys(req)
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

function getCommunity(req, res) {
    let country = req.params.country;
    let communityId = req.params.communityId;
    var bitwebResponse = new BitwebResponse();

    if (communityId != null) {
        serviceCommunity.getById(country, communityId)
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

function modifyCommunity(req, res) {
    let country = req.body.country;
    var bitwebResponse = new BitwebResponse();

    serviceCommunity.update(country, req)
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
function removeCommunity(req, res) {
    let country = req.params.country;
    var bitwebResponse = new BitwebResponse();

    serviceCommunity.remove(country, req)
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

function fileUpload(req, res) {
    let bitwebResponse = new BitwebResponse();
    let communityId = req.params.communityId;
    let country = req.params.country;
    let singleUpload = awsS3.upload();

    if (communityId != null) {
        singleUpload(req, res, function (err, result) {
            if (err) {
                res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
            }

            console.log('req.file=>', JSON.stringify(req.file))

            let image = {
                "path": req.file.location,
                "bucket": req.file.bucket,
                "key": req.file.key,
                "origin_name": req.file.originalname,
                "size": req.file.size,
                "mimetype": req.file.mimetype,
                "regDate": util.formatDate(new Date().toLocaleString('ko-KR'))
            }
            let data = {
                'images':[]
            }
            data['images'].push(image);
            req.body['images'] = data['images'];
            serviceCommunity.update(country, req)
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
        });
    } else {
        let err = "Need communityId in path parameter"
        bitwebResponse.code = 400;
        bitwebResponse.message = err;
        res.status(400).send(bitwebResponse.create())
    }
}

exports.addCommunity = addCommunity;
exports.listCommunitys = listCommunitys;
exports.getCommunity = getCommunity;
exports.modifyCommunity = modifyCommunity;
exports.removeCommunity = removeCommunity;
exports.fileUpload = fileUpload;