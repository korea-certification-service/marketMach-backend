var db = require('../../utils/db');
var bitwebPersonal = require('./impl/personal');
var crypto = require('crypto');
var util = require('../../utils/util')

function getById(country, personalId) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebPersonal.getById(personalId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function update(country, req) {
    return new Promise((resolve , reject) => {

        let personalId = req.params.personalId;
        let data = {};
        data = req.body;
        data['replyDate'] = util.formatDate(new Date().toString())

        db.connectDB(country)
            .then(() => bitwebPersonal.updateById(personalId, data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function listPersonal (req) {
    let country = req.body.country;
    let data = {};
    if(req.body.title != undefined) {
        data = {
            $or: [{'title' : { $regex: req.body.title, $options: 'i' }}, {'content' : { $regex: req.body.title, $options: 'i' }} ]
        }
    }
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebPersonal.listPersonal(data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

exports.update = update;
exports.listPersonal = listPersonal;
exports.getById = getById;
