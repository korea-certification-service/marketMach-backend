let db = require('../utils/db');

function paging(obj) {

    let { model, condition, limit, skip, search }  = obj;

    if(!model) return console.error('모델객체를 찾을 수 없습니다.');
    if(!condition) condition = {};
    if(!limit) limit = 0;
    if(!skip) skip = 0;
    if(!search || !search.key || !search.val) {
        search.key = 'regDate';
        search.val = '';
    }

    limit = parseInt(limit)
    skip = parseInt(skip)

    let total = 0

    return new Promise((resolve, reject) => {
        db.connectDB()
        .then(() => {
            if(search.key.match(/_id/gi) != null) {
                let newCondition = search.val  == '' ? condition : Object.assign(condition, {'item._id': search.val});
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
                .where(search.key).regex(search.val)
                .then(count => {
                    total = count
                    model.find(condition)
                    .where(search.key).regex(search.val)
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
}

exports.paging = paging;