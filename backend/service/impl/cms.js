var Cms = require('../../model/cms');

function create (data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        var cms = new Cms(data)

        cms.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log('createCms done: ' + result)
                resolve(result)
            }
        })
    })
}

function getById (cmsId) {
    return new Promise((resolve, reject) => {
        Cms.findOne(
            {"_id": cmsId},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getCmsById done: ' + user)
                resolve(user)
            }
        )
    })
}

function updateById (cmsId, body) {
    return new Promise((resolve, reject) => {
        Cms.findOneAndUpdate(
            {"_id": cmsId
            },
            {$set: body
            },
            {upsert: false, new: true},
            function(err, data) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updateCmsById done: ' + data)
                resolve(data)
            })
    })
}

function deleteById (cmsId) {
    return new Promise((resolve, reject) => {
        Cms.findByIdAndRemove(
            cmsId,
            function(err, data) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('deleteCmsById done: ' + data)
                resolve(data)
            }
        )
    })
}

function listCms (data) {
    return new Promise((resolve, reject) => {
        Cms.find(data)
            .sort({regDate: 'desc'})
            .exec(function (err, cms) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('listCms done: ' + cms)
                resolve(cms)
            })
    })
}

exports.create = create;
exports.getById = getById;
exports.updateById = updateById;
exports.deleteById = deleteById;
exports.listCms = listCms;
