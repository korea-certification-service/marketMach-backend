var Communitys = require('../../model/communities');

function createCommunity (data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        var faqs = new Communitys(data)

        faqs.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log('createCommunity done: ' + result)
                resolve(result)
            }
        })
    })
}

function getCommunityById (communityId) {
    return new Promise((resolve, reject) => {
        Communitys.findOne(
            {"_id": communityId},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getCommunityById done: ' + user)
                resolve(user)
            }
        )
    })
}

function updateCommunityById(communityId, body) {
    return new Promise((resolve, reject) => {
        Communitys.findOneAndUpdate(
            {"_id": communityId
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

function deleteCommunityById (communityId) {
    return new Promise((resolve, reject) => {
        Communitys.findByIdAndRemove(
            communityId,
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('deleteCommunityById done: ' + user)
                resolve(user)
            }
        )
    })
}

function listCommunitys (data) {
    return new Promise((resolve, reject) => {
        Communitys.find(data)
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('listCommunitys done: ' + item)
                resolve(item)
            })
    })
}

exports.createCommunity = createCommunity;
exports.getCommunityById = getCommunityById;
exports.updateCommunityById = updateCommunityById;
exports.deleteCommunityById = deleteCommunityById;
exports.listCommunitys = listCommunitys;
