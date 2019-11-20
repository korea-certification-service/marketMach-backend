/**
 * 관리자 - 스테프 API(현재 사용 안함)
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-26
 */
var express = require('express');
var router = express.Router();
let crypto = require('crypto');
var serviceStaff = require('../../service/staff');

router.post("/", (req, res) => {

    let userTag = req.body.userTag;
    let password = crypto.createHash('sha256').update(req.body.password).digest('base64');

    serviceStaff.getStaffByIdAndPassword({
        userTag: userTag,
        password: password
    })
    .then(async success => {
        if(success != null) {

            res.status(200).send(success);
            
            console.log("--------success--------");
            console.log(success);
            console.log("--------/success--------");
        } else {
            res.status(401).send(false);
        }
    }).catch(err => {
        console.log("--------err--------");
        console.log(err);
        console.log("--------/err--------");
    });
})

module.exports = router; 