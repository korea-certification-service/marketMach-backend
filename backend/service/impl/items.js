let Items = require('../../model/items');

function getItemsByIds(ids) {
    return new Promise((resolve, reject) => {
        Items.find(
            {
                "_id": {$in: ids},
            })
            .sort({regDate:'desc'})
            .exec(function (err, item) {
                    if (err) {
                        console.error(err)
                        reject(err)
                    }
                    console.log('getItemsByIds done: ' + item)
                    resolve(item)
                }
            )
    })
}

function updateItemStatus(id, body) {
    return new Promise((resolve, reject) => {
        Items.findOneAndUpdate(
            {"_id": id},
            {$set: body},
            function(err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('updateItemStatus done: ' + item)
                resolve(item)
            }
        )
    })
}

exports.getItemsByIds = getItemsByIds;
exports.updateItemStatus = updateItemStatus;