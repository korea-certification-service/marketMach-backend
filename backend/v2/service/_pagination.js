let db = require('../utils/db');

function paging(obj) {

    let { model, condition, limit, skip, search }  = obj;

    if(!model) return console.error('모델객체를 찾을 수 없습니다.');
    if(!condition) condition = {};
    if(!limit) limit = 0;
    if(!skip) skip = 0;
    if(!search) search.regDate = '';

    limit = parseInt(limit)
    skip = parseInt(skip)
    searchKey = Object.keys(search)[0] || 'regDate';
    searchValue = Object.values(search)[0] || '';

    let total = 0

    return new Promise((resolve, reject) => {
        db.connectDB()
        .then(() => {
            if(searchKey.match(/_id/gi) != null) {
                let newCondition = searchValue  == '' ? condition : Object.assign(condition, search);
                model.countDocuments(newCondition)
                .then(count => {
                    total = count
                    model.find(newCondition)
                    .sort({'regDate':-1})
                    .skip(skip)
                    .limit(limit)
                    .exec((err, rs) => {
                        if (err) {
                            reject({ success: false, msg: err });
                        }
                        resolve({ success: true, t: total, ds: rs});
                    })
                })
            } else {
                model.countDocuments(condition)
                .where(searchKey).regex(searchValue)
                .then(count => {
                    total = count
                    model.find(condition)
                    .where(searchKey).regex(searchValue)
                    .sort({'regDate':-1})
                    .skip(skip)
                    .limit(limit)
                    .exec((err, rs) => {
                        if (err) {
                            reject({ success: false, msg: err });
                        }
                        resolve({ success: true, t: total, ds: rs});
                    })
                });
            }
        }).catch(err => {
            reject(err)
        });
    });

    // if(searchKey == "_id") {

    //     let newCondition = searchValue  == '' ? condition : Object.assign(condition, search);

    //     return new Promise((resolve, reject) => {
    //         db.connectDB(country)
    //         .then(() => {
    //             model.countDocuments(newCondition)
    //             .then(count => {
    //                 total = count
    //                 model.find(newCondition)
    //                 .sort({'regDate':-1})
    //                 .skip(skip)
    //                 .limit(limit)
    //                 .exec((err, rs) => {
    //                     if (err) {
    //                         reject({ success: false, msg: err });
    //                     }
    //                     resolve({ success: true, t: total, ds: rs});
    //                 })
    //             })
    //         }).catch(err => {
    //             reject(err)
    //         });
    //     });
    // } else {
    //     return new Promise((resolve, reject) => {
    //         db.connectDB(country)
    //         .then(() => {
    //             model.countDocuments(condition)
    //             .where(searchKey).regex(searchValue)
    //             .then(count => {
    //                 total = count
    //                 model.find(condition)
    //                 .where(searchKey).regex(searchValue)
    //                 .sort({'regDate':-1})
    //                 .skip(skip)
    //                 .limit(limit)
    //                 .exec((err, rs) => {
    //                     if (err) {
    //                         reject({ success: false, msg: err });
    //                     }
    //                     resolve({ success: true, t: total, ds: rs});
    //                 })
    //             });
    //         }).catch(err => {
    //             reject(err)
    //         });
    //     })
    // }
}

exports.paging = paging;