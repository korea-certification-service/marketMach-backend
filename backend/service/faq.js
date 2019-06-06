var db = require('../../utils/db');
var bitwebFaq = require('./impl/faq');
var crypto = require('crypto');
var util = require('../../utils/util')

function getById(country, faqId) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebFaq.getFaqById(faqId))
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
            .then(() => bitwebFaq.createFaq(data))
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

        let faqId = req.params.faqId;
        let data = {};
        data = req.body;

        db.connectDB(country)
            .then(() => bitwebFaq.updateFaqById(faqId, data))
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

        let faqId = req.params.faqId;
        db.connectDB(country)
            .then(() => bitwebFaq.deleteFaqById(faqId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function listFaqs (req) {
    let country = req.body.country;
    let data = {};
    if(req.body.title != undefined) {
        data = {
            $or: [{'title' : { $regex: req.body.title, $options: 'i' }}, {'content' : { $regex: req.body.title, $options: 'i' }}, {'category' : { $regex: req.body.title, $options: 'i' }}, ]
        }
    }
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebFaq.listFaqs(data))
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
exports.listFaqs = listFaqs;
