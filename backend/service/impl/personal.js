var Personal = require('../../model/personal');

function getById (personalId) {
    return new Promise((resolve, reject) => {
        Personal.findOne(
            {"_id": personalId},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getById done: ' + user)
                resolve(user)
            }
        )
    })
}

function updateById(personalId, body) {
    return new Promise((resolve, reject) => {
        Personal.findOneAndUpdate(
            {"_id": personalId
            },
            {$set: body
            },
            {upsert: false, new: true},
            function(err, data) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(data)
            })
    })
}

function listPersonal (data) {
    return new Promise((resolve, reject) => {
        Personal.find(data)
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('listPersonal done: ' + item)
                resolve(item)
            })
    })
}

exports.getById = getById;
exports.updateById = updateById;
exports.listPersonal = listPersonal;
