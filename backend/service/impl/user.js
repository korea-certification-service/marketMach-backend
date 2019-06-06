var User = require('../../model/user');
var WithdrawUsers = require('../../model/withdrawUsers');

function listUsers (body, data) {
    return new Promise((resolve, reject) => {
        User.find(body)
            .limit(data.perPage)
            .skip(data.pageIdx * data.perPage)
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getUsersAll done: ' + item)
                resolve(item)
            })
    })
}

function getUserByPointIds(ids) {
    return new Promise((resolve, reject) => {
        User.find({
            "pointId": {$in: ids}
        })
        .exec(function (err, users) {
            if (err) {
                console.error(err)
                reject(err)
            }
            console.log('getUserByPointIds done: ' + users)
            resolve(users)
        })
    })
}

function getUserByCoinIds(ids) {
    return new Promise((resolve, reject) => {
        User.find({
            "coinId": {$in: ids}
        })
            .exec(function (err, users) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getUserByCoinIds done: ' + users)
                resolve(users)
            })
    })
}

function getByUserId (userId) {
    return new Promise((resolve, reject) => {
        User.findOne(
            {"_id": userId},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getByUserId done: ' + user)
                resolve(user)
            }
        )
    })
}

function update(userId, data) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate(
            {"_id": userId},
            {$set:data},
            {upsert: true, new: true},
            function(err, user) {
                if (err) {
                    console.error(err);
                    reject(err)
                }
                console.log('update done: ' + user._id);
                resolve(user)
            }
        )
    });
}

function deleteUserById (id) {
    return new Promise((resolve, reject) => {
        User.findByIdAndRemove(
            id,
            function(err, user) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                console.log('deleteUserById done: ' + user);
                resolve(user)
            }
        )
    })
}

function createWithdrawUser(data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        var withdrawUsers = new WithdrawUsers(data)
        withdrawUsers.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log('createWithdrawUser done: ' + result)
                resolve(result)
            }
        })
    })
}

exports.listUsers = listUsers;
exports.getUserByPointIds = getUserByPointIds;
exports.getUserByCoinIds = getUserByCoinIds;
exports.getByUserId = getByUserId;
exports.update = update;
exports.deleteUserById = deleteUserById;
exports.createWithdrawUser = createWithdrawUser;
