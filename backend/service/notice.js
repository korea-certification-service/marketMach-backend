var db = require('../../utils/db');
var bitwebNotice = require('./impl/notice');
var crypto = require('crypto');
var util = require('../../utils/util')

function getById(country, noticeId) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebNotice.getNoticeById(noticeId))
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
            .then(() => bitwebNotice.createNotice(data))
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

        let noticeId = req.params.noticeId;
        let data = {};
        data = req.body;

        db.connectDB(country)
            .then(() => bitwebNotice.updateNoticeById(noticeId, data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function remove(country, req) {
    return new Promise((resolve, reject) => {

        let noticeId = req.params.noticeId;
        db.connectDB(country)
            .then(() => bitwebNotice.deleteNoticeById(noticeId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function listNotices (req) {
    let country = req.body.country;
    let data = {};
    if(req.body.title != undefined) {
        data = {
            $or: [{'title' : { $regex: req.body.title, $options: 'i' }}, {'content' : { $regex: req.body.title, $options: 'i' }} ]
        }
    }
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebNotice.listNotices(data))
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
exports.update = update;
exports.remove = remove;
exports.listNotices = listNotices;
