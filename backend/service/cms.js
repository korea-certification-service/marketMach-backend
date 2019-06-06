var db = require('../../utils/db');
var bitwebCms = require('./impl/cms');
var crypto = require('crypto');
var util = require('../../utils/util')

function getById(country, cmsId) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebCms.getById(cmsId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function create(country, req) {
    return new Promise((resolve, reject) => {

        var data = req.body;
        data['worker'] = req.session.userName;
        data['regDate'] = util.formatDate(new Date());

        db.connectDB(country)
            .then(() => bitwebCms.create(data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })

}

function updateById(country, req) {
    return new Promise((resolve , reject) => {

        let cmsId = req.params.cmsId;
        let data = {};
        data = req.body;

        db.connectDB(country)
            .then(() => bitwebCms.updateById(cmsId, data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function removeById(country, req) {
    return new Promise((resolve, reject) => {

        let cmsId = req.params.cmsId;
        db.connectDB(country)
            .then(() => bitwebCms.deleteById(cmsId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function listCms (req) {
    let country = req.body.country;
    let data = {};
    if(req.body.title != undefined) {
        data = {
            $or: [{'title' : { $regex: req.body.title, $options: 'i' }}, {'content' : { $regex: req.body.title, $options: 'i' }}, {'category' : { $regex: req.body.title, $options: 'i' }}, ]
        }
    }
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebCms.listCms(data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

exports.getById = getById;
exports.create = create;
exports.updateById = updateById;
exports.removeById = removeById;
exports.listCms = listCms;
