var Staff = require('../../model/staff');

function createStaff (data) {
    return new Promise((resolve, reject) => {
        console.log(data)
        Staff.findOneAndUpdate(
            {
                "email": data.email
            },
            {
                $set:data
            },
            {upsert: true, new: true},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('createStaff done: ' + user._id)
                resolve(user)
            }
        )
    })
}

function getStaffById (id) {
    return new Promise((resolve, reject) => {
        Staff.findOne(
            {"_id": id},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getStaffById done: ' + user)
                resolve(user)
            }
        )
    })
}

function getStaffByTag (userTag) {
    return new Promise((resolve, reject) => {
        Staff.findOne(
            {"userTag": userTag},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getStaffByTag done: ' + user)
                resolve(user)
            }
        )
    })
}

function getStaffByIdAndPassword (data) {
    return new Promise((resolve, reject) => {
        Staff.findOne(
            {
                "userTag"        : data.userTag,
                "password"  : data.password
            },
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getStaffByIdAndPassword done: ' + user)
                resolve(user)
            }
        )
    })
}

function getStaffByTagAndEmail (userTag, email) {
    return new Promise((resolve, reject) => {
        Staff.findOne(
            {$or: [
            {"userTag":userTag},
            {"email": email},
            ]},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getStaffByTagAndEmail done: ' + user)
                resolve(user)
            }
        )
    })
}

function getStaffByEmail (email) {
    return new Promise((resolve, reject) => {
        Staff.findOne(
            {"email": email},
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getStaffByEmail done: ' + user)
                resolve(user)
            }
        )
    })
}

function updateStaffById(staffId, body) {
    return new Promise((resolve, reject) => {
        Staff.findOneAndUpdate(
            {"_id": staffId
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

function deleteStaffById (id) {
    return new Promise((resolve, reject) => {
        Staff.findByIdAndRemove(
            id,
            function(err, user) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getStaffById done: ' + user)
                resolve(user)
            }
        )
    })
}

function listStaffs () {
    return new Promise((resolve, reject) => {
        Staff.find({})
            .sort({regDate: 'desc'})
            .exec(function (err, item) {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                console.log('getStaffsAll done: ' + item)
                resolve(item)
            })
    })
}


exports.createStaff = createStaff;
exports.getStaffById = getStaffById;
exports.getStaffByTag = getStaffByTag;
exports.getStaffByTagAndEmail = getStaffByTagAndEmail;
exports.getStaffByIdAndPassword = getStaffByIdAndPassword;
exports.getStaffByEmail = getStaffByEmail;
exports.updateStaffById = updateStaffById;
exports.deleteStaffById = deleteStaffById;
exports.listStaffs = listStaffs;
