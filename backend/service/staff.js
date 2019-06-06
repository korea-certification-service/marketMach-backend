var db = require('../../utils/db');
var bitwebStaff = require('./impl/staff');
var crypto = require('crypto');
var util = require('../../utils/util')

function get(country, req) {
    return new Promise((resolve, reject) => {
        var userId = req.params.staffId;
        db.connectDB(country)
            .then(() => bitwebStaff.getStaffById(userId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
                reject(err)
        })
    })
}

function getById(country, userId) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebStaff.getStaffById(userId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function getByStaffTag(country, userTag) {
    return new Promise((resolve, reject) => {

        db.connectDB()
            .then(() => bitwebStaff.getStaffByTag(userTag))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function getByStaffEmail(country, email) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebStaff.getStaffByEmail(email))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function getByStaffTagAndEmail(country, userTag, email) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebStaff.getStaffByTagAndEmail(userTag, email))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function getStaff(country, data) {
    return new Promise((resolve, reject) => {

        db.connectDB(country)
            .then(() => bitwebStaff.getStaffByIdAndPassword(data))
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
        db.connectDB(country)
            .then(() => bitwebStaff.createStaff(data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })

}

function createWithIds(country, req) {
    return new Promise((resolve , reject) => {

        var data = req.body;

        var password = crypto.createHash('sha256').update(req.body.password).digest('base64');
        data['password'] = password;
        data['active'] = true;
        data['regDate'] = util.formatDate(new Date())

        console.log('createWithIds data=>', data);

        db.connectDB(country)
            .then(() => bitwebStaff.createStaff(data))
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

        var staffId = req.params.staffId;

        var data = {};
        data = req.body;

        if (data.password != undefined) {
            var password = crypto.createHash('sha256').update(data.password).digest('base64');
            data['password'] = password;
        }

        db.connectDB(country)
            .then(() => bitwebStaff.updateStaffById(staffId, data))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function updateEmailAuth(country, userId, data) {
    return new Promise((resolve , reject) => {

        db.connectDB(country)
            .then(() => bitwebStaff.updateStaffById(userId, data))
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
            .then(() => bitwebStaff.deleteStaffById(userId))
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

function listStaffs () {
    let country = "KR";
    return new Promise((resolve, reject) => {
        db.connectDB(country)
            .then(() => bitwebStaff.listStaffs())
            .then((result) => {
                console.log('result=>' , result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}

exports.get = get;
exports.getById = getById;
exports.getByStaffTag = getByStaffTag;
exports.getByStaffEmail = getByStaffEmail;
exports.getByStaffTagAndEmail = getByStaffTagAndEmail;
exports.getStaff = getStaff;
exports.create = create;
exports.createWithIds = createWithIds;
exports.update = update;
exports.updateEmailAuth = updateEmailAuth;
exports.remove = remove;
exports.listStaffs = listStaffs;
