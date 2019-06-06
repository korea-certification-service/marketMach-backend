var Notices = require('../../model/notices');

function createNotice (data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        var faqs = new Notices(data)

        faqs.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log('createNotice done: ' + result)
                resolve(result)
            }
        })
    })
}

function getNoticeById (noticeId) {
    return new Promise((resolve, reject) => {
        Notices.findOne(
            {"_id": noticeId},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getNoticeById done: ' + user)
                resolve(user)
            }
        )
    })
}

function updateNoticeById(noticeId, body) {
    return new Promise((resolve, reject) => {
        Notices.findOneAndUpdate(
            {"_id": noticeId
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

function deleteNoticeById (noticeId) {
    return new Promise((resolve, reject) => {
        Notices.findByIdAndRemove(
            noticeId,
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('deleteNoticeById done: ' + user)
                resolve(user)
            }
        )
    })
}

function listNotices (data) {
    return new Promise((resolve, reject) => {
        Notices.find(data)
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('listNotices done: ' + item)
                resolve(item)
            })
    })
}

exports.createNotice = createNotice;
exports.getNoticeById = getNoticeById;
exports.updateNoticeById = updateNoticeById;
exports.deleteNoticeById = deleteNoticeById;
exports.listNotices = listNotices;
