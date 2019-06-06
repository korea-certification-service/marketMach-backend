var Vtrs = require('../../model/vtrs');
var VtrTemps = require('../../model/vtrTemps');

function listVtrs (body, data) {
    return new Promise((resolve, reject) => {
        Vtrs.find(body)
            .limit(data.perPage)
            .skip(data.pageIdx * data.perPage)
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getVtrsAll done: ' + item)
                resolve(item)
            })
    })
}

function getVtrById(vtrId) {
    return new Promise((resolve, reject) => {
        Vtrs.findOne({"_id":vtrId})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getVtrsAll done: ' + item)
                resolve(item)
            })
    })
}

function updateVtr(vtrId, data) {
    return new Promise((resolve, reject) => {
        Vtrs.findOneAndUpdate(
            {"_id": vtrId},
            {$set: data},
            function(err, vtr) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updateVtr done: ' + vtr)
                resolve(vtr)
            }
        )
    })
}

function deleteVtr(vtrId) {
    return new Promise((resolve, reject) => {
        Vtrs.findByIdAndRemove(
            vtrId,
            function (err, vtr) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('deleteVtr done: ' + vtr)
                resolve(vtr)
            }
        )
    })
}

function deleteVtrTempByItemId (id) {
    return new Promise((resolve, reject) => {
        VtrTemps.findByIdAndRemove(
            {"item._id": id},
            function(err, vtr) {
                if (err) {
                    // console.error(err)
                    reject(err)
                }
                console.log('deleteVtrTempById done: ' + vtr)
                resolve(vtr)
            }
        )
    })
}


exports.listVtrs = listVtrs;
exports.updateVtr = updateVtr;
exports.deleteVtr = deleteVtr;
exports.getVtrById = getVtrById;
exports.deleteVtrTempByItemId = deleteVtrTempByItemId;