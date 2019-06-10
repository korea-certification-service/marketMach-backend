let Agreements = require('../../model/agreements');

function list(condition) {
    return new Promise((resolve, reject) => {
        Agreements.find(
            condition,
            function(err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            }
        )
    })
}

function detail(condition) {
    return new Promise((resolve, reject) => {
        Agreements.findOne(
            condition,
            function(err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            }
        )
    })
}

function add(data) {
    return new Promise((resolve, reject) => {
        var agreements = new Agreements(data)
        agreements.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

function modify(condition, setData) {
    return new Promise((resolve, reject) => {
        Agreements.findOneAndUpdate(
            condition,
            setData,
            {upsert: false, new: true},
            function(err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
    })
}

function remove(condition) {
    return new Promise((resolve, reject) => {
        Agreements.findByIdAndRemove(
            condition,
            function(err, user) {
                if (err) {
                    reject(err)
                }
                resolve(user)
            }
        )
    })
}

exports.list = list;
exports.detail = detail;
exports.add = add;
exports.modify = modify;
exports.remove = remove;