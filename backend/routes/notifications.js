var express = require('express');
var router = express.Router();
var BitwebResponse = require('../utils/BitwebResponse')
var controllerUsers = require('../controllers/users');
var mqtt = require('../utils/mqtt');
const crypto = require("crypto");
const config = require('../config/dbconfig');

router.post('/auth', function (req, res, next) {

    var bitwebResponse = new BitwebResponse();
    if (req.body.to != null) {

        let jsonData = {};
        let country = req.session.country;
        let userId = req.body.userId;
        let from = config.mailer.user;
        let subject = config.mailer.auth.subject;
        let link_url = config.mailer.auth.link_url;

        // jsonData['to'] = 'sales@daiblab.com'
        // jsonData['userId'] = userId;
        jsonData['to'] = req.body.to;
        jsonData['from'] = from;
        jsonData['subject'] = subject;
        // jsonData['text'] = req.body.text;

        let testJson = {
            "userId": "qwer",
            "to": "kay@daiblab.com",
            "from": "mailer@daiblab.com",
            "subject": "Bitweb Authentication"
        }

        controllerUsers.getById(country, userId)
            .then(result => {
                if (result == null) {
                    console.error('err=>', err)
                    bitwebResponse.code = 403;
                    bitwebResponse.message = "Check userId!";
                    res.status(403).send(bitwebResponse.create())
                } else {

                    let auth_key = crypto.randomBytes(3).toString("hex");
                    console.log('auth_key=>', auth_key);

                    jsonData['userId'] = userId;
                    jsonData['auth_key'] = auth_key;
                    jsonData['html'] = config.mailer.auth.content1 + "["
                        + auth_key + "]" + config.mailer.auth.content2
                        + link_url + config.mailer.auth.content3
                    mqtt.publishEmail(jsonData)
                        .then((result) => {
                            // mqtt.subscribeEmail();
                            let data = {}
                            data['mail_auth_code'] = auth_key;

                            controllerUsers.updateEmailAuth(country, userId, data)
                            bitwebResponse.code = 200;
                            bitwebResponse.data = "Send to your email!";
                            res.status(200).send(bitwebResponse.create())
                        }).catch((err) => {
                        console.error('err=>', err)
                        bitwebResponse.code = 500;
                        bitwebResponse.message = err;
                        res.status(500).send(bitwebResponse.create())
                    })
                }
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    } else {

        var err = "Need email in req body"
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(400).send(bitwebResponse.create())
    }
})

router.put('/auth', function (req, res, next) {

    let testJson = {
        "userId": "1234",
        "mail_auth_code": "asdf"
    }

    var bitwebResponse = new BitwebResponse();
    if (req.body.mail_auth_code != null) {

        let userId = req.body.userId;
        let mail_auth_code = req.body.mail_auth_code;
        let country = req.session.country;

        controllerUsers.getById(country, userId)
            .then(result => {

                let db_mail_auth_code = result.mail_auth_code;
                if (db_mail_auth_code == mail_auth_code) {

                    let data = {}
                    data['active'] = true
                    controllerUsers.updateEmailAuth(country, userId, data)
                        .then(result => {

                            req.session.active = true;

                            bitwebResponse.code = 200;
                            bitwebResponse.data = "user active is true!";
                            res.status(200).send(bitwebResponse.create())
                        })
                } else {
                    bitwebResponse.code = 403;
                    bitwebResponse.data = "mail_auth_code does not match !";
                    res.status(403).send(bitwebResponse.create())
                }
            }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        })
    }
});

router.get("/findId/:email", function(req, res, next){
    let email = req.params.email;
    let country = config.country;

    var bitwebResponse = new BitwebResponse();

    controllerUsers.getByUserEmail(country, email)
        .then(result => {
            if(result == null) {
                bitwebResponse.code = 403;
                bitwebResponse.data = "InValided User!";
                res.status(403).send(bitwebResponse.create())
            } else {
                let jsonData = {};

                let from = config.mailer.user;
                let subject = config.mailer.findId.subject;
                let link_url = config.mailer.findId.link_url;

                jsonData['to'] = email;
                jsonData['from'] = from;
                jsonData['subject'] = subject;
                // jsonData['text'] = req.body.text;

                let testJson = {
                    "userId": "qwer",
                    "to": "kay@daiblab.com",
                    "from": "mailer@daiblab.com",
                    "subject": "Bitweb Authentication"
                }

                jsonData['userId'] = result._doc.userTag;
                jsonData['html'] = config.mailer.findId.content1 + result._doc.userTag + config.mailer.findId.content2 + link_url + config.mailer.findId.content3;
                mqtt.publishEmail(jsonData)
                    .then((result) => {
                        bitwebResponse.code = 200;
                        bitwebResponse.data = "Send to your email!";
                        res.status(200).send(bitwebResponse.create())
                    }).catch((err) => {
                    console.error('err=>', err)
                    bitwebResponse.code = 500;
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create())
                })
            }
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
})

router.get("/findPassword/:userTag/:email", function(req, res, next){
    let userTag = req.params.userTag;
    let email = req.params.email;
    let country = config.country;

    var bitwebResponse = new BitwebResponse();

    controllerUsers.getByUserTagAndEmail1(country, userTag, email)
        .then(result => {
            if(result == null) {
                bitwebResponse.code = 403;
                bitwebResponse.data = "InValided User!";
                res.status(403).send(bitwebResponse.create())
            } else {
                let password = "";
                let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for( var i=0; i < 10; i++ )
                    password += possible.charAt(Math.floor(Math.random() * possible.length));

                controllerUsers.updatePassword(country, result._doc._id, password)
                    .then((user) => {
                        let jsonData = {};

                        let from = config.mailer.user;
                        let subject = config.mailer.findPassword.subject;
                        let link_url = config.mailer.findPassword.link_url;

                        jsonData['to'] = email;
                        jsonData['from'] = from;
                        jsonData['subject'] = subject;
                        // jsonData['text'] = req.body.text;

                        let testJson = {
                            "userId": "qwer",
                            "to": "kay@daiblab.com",
                            "from": "mailer@daiblab.com",
                            "subject": "Bitweb Authentication"
                        }

                        jsonData['userId'] = userTag;
                        jsonData['html'] = config.mailer.findPassword.content1 + password + config.mailer.findPassword.content2 + config.mailer.findPassword.content3 + link_url + config.mailer.findPassword.content4;

                        mqtt.publishEmail(jsonData)
                            .then((result) => {
                                bitwebResponse.code = 200;
                                bitwebResponse.data = "Send to your email!";
                                res.status(200).send(bitwebResponse.create())
                            }).catch((err) => {
                            console.error('err=>', err)
                            bitwebResponse.code = 500;
                            bitwebResponse.message = err;
                            res.status(500).send(bitwebResponse.create())
                        })
                    }).catch((err) => {
                    console.error('err=>', err)
                    bitwebResponse.code = 500;
                    bitwebResponse.message = err;
                    res.status(500).send(bitwebResponse.create())
                });
            }
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    });
})

module.exports = router;
