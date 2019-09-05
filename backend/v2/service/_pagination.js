let db = require('../utils/db');

function paging(req, res, Model, country, condition, searchTarget) {

    let { search, skip, limit } = req.query

    if(!limit) limit = 0;
    if(!skip) skip = 0;
    if(!search) search = '';

    limit = parseInt(limit)
    skip = parseInt(skip)

    let total = 0

    return new Promise((resolve, reject) => {
        db.connectDB(country)
        .then(() => {
            Model.countDocuments(condition)
            .where(searchTarget).regex(search)
            .then(count => {
                total = count
                Model.find(condition)
                .where(searchTarget).regex(search)
                .sort({'regDate':-1})
                .skip(skip)
                .limit(limit)
                .exec((err, rs) => {
                    if (err) {
                        reject({ success: false, msg: e.message });
                    }
                    resolve({ success: true, t: total, ds: rs, token: req.token });
                })
            });
        }).catch(err => {
            reject(err)
        });
    })
}

exports.paging = paging;