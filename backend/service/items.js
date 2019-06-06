let db = require('../../utils/db');
let serviceItems = require('./impl/items');

function getItemsByIds(ids) {
    return new Promise((resolve, reject) => {
        db.connectDB()
            .then(() => serviceItems.getItemsByIds(ids))
            .then((result) => {
                console.log('result=>', result);
                resolve(result)
            }).catch((err) => {
            reject(err)
        })
    })
}



exports.getItemsByIds = getItemsByIds;