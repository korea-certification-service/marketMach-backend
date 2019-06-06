var BusinessContacts = require('../../model/businessContacts');

function createBusinessContact (data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        var faqs = new BusinessContacts(data)

        faqs.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log('createBusinessContact done: ' + result)
                resolve(result)
            }
        })
    })
}

function getBusinessContactById (businessContactId) {
    return new Promise((resolve, reject) => {
        BusinessContacts.findOne(
            {"_id": businessContactId},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getBusinessContactById done: ' + user)
                resolve(user)
            }
        )
    })
}

function updateBusinessContactById(businessContactId, body) {
    return new Promise((resolve, reject) => {
        BusinessContacts.findOneAndUpdate(
            {"_id": businessContactId
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

function deleteBusinessContactById (businessContactId) {
    return new Promise((resolve, reject) => {
        BusinessContacts.findByIdAndRemove(
            businessContactId,
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('deleteBusinessContactById done: ' + user)
                resolve(user)
            }
        )
    })
}

function listBusinessContacts (data) {
    return new Promise((resolve, reject) => {
        BusinessContacts.find(data)
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('listBusinessContacts done: ' + item)
                resolve(item)
            })
    })
}

exports.createBusinessContact = createBusinessContact;
exports.getBusinessContactById = getBusinessContactById;
exports.updateBusinessContactById = updateBusinessContactById;
exports.deleteBusinessContactById = deleteBusinessContactById;
exports.listBusinessContacts = listBusinessContacts;
