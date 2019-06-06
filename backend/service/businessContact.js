var db = require('../../utils/db');
var bitwebBusinessContact = require('./impl/businessContact');
var crypto = require('crypto');
var util = require('../../utils/util')

function getById(country, businessContactId) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebBusinessContact.getBusinessContactById(businessContactId))
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
            .then(() => bitwebBusinessContact.createBusinessContact(data))
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

        let businessContactId = req.params.businessContactId;
        let data = {};
        data = req.body;

        db.connectDB(country)
            .then(() => bitwebBusinessContact.updateBusinessContactById(businessContactId, data))
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

        let businessContactId = req.params.businessContactId;
        db.connectDB(country)
            .then(() => bitwebBusinessContact.deleteBusinessContactById(businessContactId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function listBusinessContacts (req) {
    let country = req.body.country;
    let data = {};
    if(req.body.title != undefined) {
        data = {
            $or: [{'title' : { $regex: req.body.title, $options: 'i' }}, {'content' : { $regex: req.body.title, $options: 'i' }} ]
        }
    }
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebBusinessContact.listBusinessContacts(data))
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
exports.listBusinessContacts = listBusinessContacts;
