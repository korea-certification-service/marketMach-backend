var db = require('../../utils/db');
var bitwebCommunity = require('./impl/community');
var crypto = require('crypto');
var util = require('../../utils/util')

function getById(country, communityId) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebCommunity.getCommunityById(communityId))
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
        data['reporter'] = req.session.userName;
        data['regDate'] = util.formatDate(new Date());

        db.connectDB(country)
            .then(() => bitwebCommunity.createCommunity(data))
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

        let communityId = req.params.communityId;
        let data = {};
        data = req.body;

        db.connectDB(country)
            .then(() => bitwebCommunity.updateCommunityById(communityId, data))
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

        let communityId = req.params.communityId;
        db.connectDB(country)
            .then(() => bitwebCommunity.deleteCommunityById(communityId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function listCommunitys (req) {
    let country = req.body.country;
    let data = {};
    if(req.body.title != undefined) {
        data = {
            $or: [{'title' : { $regex: req.body.title, $options: 'i' }}, {'content' : { $regex: req.body.title, $options: 'i' }} ]
        }
    }
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebCommunity.listCommunitys(data))
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
exports.listCommunitys = listCommunitys;
