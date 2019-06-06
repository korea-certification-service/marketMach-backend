var Faqs = require('../../model/faq');

function createFaq (data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        var faqs = new Faqs(data)

        faqs.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log('createFaq done: ' + result)
                resolve(result)
            }
        })
    })
}

function getFaqById (faqId) {
    return new Promise((resolve, reject) => {
        Faqs.findOne(
            {"_id": faqId},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getFaqById done: ' + user)
                resolve(user)
            }
        )
    })
}

function updateFaqById(faqId, body) {
    return new Promise((resolve, reject) => {
        Faqs.findOneAndUpdate(
            {"_id": faqId
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

function deleteFaqById (faqId) {
    return new Promise((resolve, reject) => {
        Faqs.findByIdAndRemove(
            faqId,
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('deleteFaqById done: ' + user)
                resolve(user)
            }
        )
    })
}

function listFaqs (data) {
    return new Promise((resolve, reject) => {
        Faqs.find(data)
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('listFaqs done: ' + item)
                resolve(item)
            })
    })
}

exports.createFaq = createFaq;
exports.getFaqById = getFaqById;
exports.updateFaqById = updateFaqById;
exports.deleteFaqById = deleteFaqById;
exports.listFaqs = listFaqs;
