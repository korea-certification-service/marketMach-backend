let VtrTemps = require('../../../model/vtrTemps');

function list(condition) {
    return new Promise((resolve, reject) => {
        VtrTemps.find(
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
        VtrTemps.findOne(
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
        var vtrTemps = new VtrTemps(data)
        vtrTemps.save(function (err, result) {
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
        VtrTemps.findOneAndUpdate(
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
        VtrTemps.findByIdAndRemove(
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