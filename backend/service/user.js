var db = require('../../utils/db');
var bitwebUser = require('./impl/user');
var crypto = require('crypto');

function listUsers(req) {
    let country = req.body.country == undefined ? "KR" : req.body.country;
    let userTag = req.body.userTag;
    let perPage = req.body.perPage == undefined ? 20 : req.body.perPage;
    let pageIdx = req.body.pageIdx == undefined ? 0 : req.body.pageIdx;
    let data = {
        "perPage": perPage,
        "pageIdx": pageIdx
    }
    let body = {};
    if(userTag !== undefined) {
        body = {
            $and: [ {"userTag": userTag} ]
        };
    }

    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebUser.listUsers(body, data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function updateAuthEmail(country, userId, data) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebUser.update(userId, data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function getUser(country, userId) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebUser.getByUserId(userId))
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

        var userId = req.params.userId;

        var data = {};
        data = req.body;

        if (data.password != undefined) {
            var password = crypto.createHash('sha256').update(data.password).digest('base64');
            data['password'] = password;
        }

        db.connectDB(country)
            .then(() => bitwebUser.update(userId, data))
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

        var userId = req.params.userId;
        db.connectDB(country)
            .then(() => bitwebUser.deleteUserById(userId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function createWithdrawUser(country, data) {
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebUser.createWithdrawUser(data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

exports.listUsers = listUsers;
exports.updateAuthEmail = updateAuthEmail;
exports.getUser = getUser;
exports.update = update;
exports.remove = remove;
exports.createWithdrawUser = createWithdrawUser;
