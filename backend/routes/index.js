var express = require('express');
var router = express.Router();
var datetime = require('node-datetime');
var sessionChecker = require('../utils/session');
var util = require('../utils/util')
const dbconfig = require('../config/dbconfig')
var BitwebResponse = require('../utils/BitwebResponse');
var request = require('request');

let controllerUsers = require('../controllers/users');
let controllerBusinessContacts = require('../controllers/businessContacts');
let client_id = 'N190vIFvGWb_8YJWKoLJ';
let client_secret = 'Q352gLIubZ';
let state = "RAMDOM_STATE";
let redirectURI = encodeURI(dbconfig.naver_login_url);
let api_url = "";


router.get('/', sessionChecker.originUrlYn, function (req, res, next) {
    //IE로 접속한 경우 지원하지 않는 페이지로 redirect처리한다.
    // if(req.headers['user-agent'].indexOf("MSIE") > -1 || req.headers['user-agent'].indexOf("Trident") > -1) {
    //     res.render('notsupport', {title: 'Bitweb Main'});
    // } else {
    //     res.render('main/index', {
    //         title: 'Bitweb Main',
    //         usePoint:dbconfig.usePoint,
    //         useBlockchain:dbconfig.useBlockchain
    //     }); 
    // }

    var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

    console.log('connection IP : ', ip);

    if(dbconfig.country == "KR") {
        res.render('v2/main/index', {
            title: 'Bitweb Main',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    } else {
        res.render('v2_en/main/index', {
            title: 'Bitweb Main',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    }

    // res.render('v2/error/coming_soon', {
    //     title: 'Bitweb Main',
    //     userId: req.session.userId,
    //     coinId: req.session.coinId,
    //     authPhone: req.session.authPhone,
    //     usePoint:dbconfig.usePoint,
    //     useBlockchain:dbconfig.useBlockchain
    // });
});

router.get('/nodev_index', function (req, res, next) {
    if(dbconfig.country == "KR") {
        res.render('v2/main/nodev_index', {
            title: 'Bitweb Main',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    } else {
        res.render('v2_en/main/nodev_index', {
            title: 'Bitweb Main',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    }
});

router.get('/main', function (req, res, next) {
    // console.log("session => ",req.session);
    // console.log("cookei => ",req.cookies);

    //IE로 접속한 경우 지원하지 않는 페이지로 redirect처리한다.
    // if(req.headers['user-agent'].indexOf("MSIE") > -1 || req.headers['user-agent'].indexOf("Trident") > -1) {
    //     res.render('notsupport', {title: 'Bitweb Main'});
    // } else {
    //     res.render('main/index', {
    //         title: 'Bitweb Main',
    //         usePoint:dbconfig.usePoint,
    //         useBlockchain:dbconfig.useBlockchain
    //     });
    // }

    var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

     console.log('connection IP : ', ip);

     if(dbconfig.country == "KR") {
        res.render('v2/main/index', {
            title: 'Bitweb Main',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    } else {
        res.render('v2_en/main/index', {
            title: 'Bitweb Main',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    }

    // res.render('v2/error/coming_soon', {
    //     title: 'Bitweb Main',
    //     userId: req.session.userId,
    //     coinId: req.session.coinId,
    //     authPhone: req.session.authPhone,
    //     usePoint:dbconfig.usePoint,
    //     useBlockchain:dbconfig.useBlockchain
    // });
});

router.get('/currency', function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/main/currency', {title: 'Currency',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    } else {
        res.render('v2_en/main/currency', {title: 'Currency',
            userId: req.session.userId,
            coinId: req.session.coinId,
            pointId: req.session.pointId,
            authPhone: req.session.authPhone,
            usePoint:dbconfig.usePoint,
            useBlockchain:dbconfig.useBlockchain
        });
    }
});

router.get('/login', sessionChecker.sessionChecker, function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/login/login', {title: 'Bitweb Main'});
    } else {
        res.render('v2_en/login/login', {title: 'Bitweb Main'});
    }
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.clearCookie("orange__F");
    res.redirect('/');
});

router.get('/header', function (req, res, next) {
    res.render('common/header', {
        title: 'Bitweb Header',
        userId: req.session.userId,
        userTag: req.session.userTag,
        country: dbconfig.country,
        pointId: req.session.pointId,
        chatbot_url: dbconfig.chatbot_url,
        usePoint:dbconfig.usePoint,
        useBlockchain:dbconfig.useBlockchain,
    });
});

router.get('/footer', function (req, res, next) {
    res.render('common/footer', {title: 'Bitweb Footer', country: dbconfig.country});
});

router.get('/page',function(req,res,next){
    res.render('common/pagination');
});

router.get('/findId', sessionChecker.sessionChecker, function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/find/findId', {title: 'Bitweb Find ID'});
    } else {
        res.render('v2_en/find/findId', {title: 'Bitweb Find ID'});
    }
});

router.get('/findPassword', sessionChecker.sessionChecker, function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/find/findPassword', {title: 'Bitweb Find Password'});
    } else {
        res.render('v2_en/find/findPassword', {title: 'Bitweb Find Password'});
    }
});

router.get('/agreement', function (req, res, next) {
    if(req.query.tid != undefined) {
        req.session.tid = req.query.tid;
    }

    if(req.query.recommander != undefined) {
        req.session.recommander = req.query.recommander;
    }

    let data = {
        title: 'Bitweb agreement', 
        country: dbconfig.country, 
        authPhone: "N", 
        username: "", 
        phone: "", 
        birth: ""
    };    
    
    if(dbconfig.country =="KR") {
        res.render('v2/login/agreement', data);
    } else {
        res.render('v2_en/login/agreement', data);
    }
});

router.get('/signup', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();

    let data = {
        title: 'Bitweb sign up', 
        country: dbconfig.country, 
        authPhone: "Y", 
        username: req.session.name, 
        phone: req.session.phone, 
        birth: req.session.birth,
        sex: req.session.sex,
        commId: req.session.commid,
        foreigner: req.session.foreigner,
        total_mach: dbconfig.bonus.signup,
        recommander: req.session.recommander,
        pushMarketing: false
    };

    if(req.query.pushMarketing != undefined) {
        data.pushMarketing = true;
    }

    if(data.phone == undefined) {
        res.redirect('/agreement');
        //next();
    } else {
        controllerUsers.getByPhone(data.country, data.phone) 
        .then((user) => {
            if(user == null) {
                if(dbconfig.country =="KR") {
                    res.render('v2/login/signup', data);
                } else {
                    res.render('v2_en/login/signup', data);
                }
            } else {
                data['userTag'] = user._doc.userTag;
                data['regDate'] = user._doc.regDate;
                if(dbconfig.country =="KR") {
                    res.render('v2/login/existUser', data);
                } else {
                    res.render('v2_en/login/existUser', data);
                }
            }
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        });
    }
});

router.get('/findResult', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();

    let data = {
        title: 'Bitweb sign up', 
        country: dbconfig.country, 
        authPhone: "Y", 
        username: req.session.name, 
        phone: req.session.phone, 
        birth: req.session.birth
    };

    if(data.phone == undefined) {
        res.redirect('/' + req.query.type);
        //next();
    } else {
        controllerUsers.getByPhone(data.country, data.phone) 
        .then((user) => {
            if(user == null) {
                res.redirect('/noResult');
            } else {
                data['id'] = user._doc._id;
                data['userTag'] = user._doc.userTag;
                data['regDate'] = user._doc.regDate;
                
                if(req.query.type == "findId") {
                    if(dbconfig.country =="KR") {
                        res.render('v2/login/existUser', data);
                    } else {
                        res.render('v2_en/login/existUser', data);
                    }
                } else {
                    if(dbconfig.country =="KR") {
                        res.render('v2/find/changePassword', data);
                    } else {
                        res.render('v2_en/find/changePassword', data);
                    }
                }
            }
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        });
    }
});

router.get('/existUser', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();

    let data = {
        title: 'Bitweb exist user'
    };

    controllerUsers.getById(dbconfig.country, req.query.id)
        .then(user => {
            data['userTag'] = user._doc.userTag;
            data['regDate'] = user._doc.regDate;
            if(dbconfig.country =="KR") {
                res.render('v2/login/existUser', data);
            } else {
                res.render('v2_en/login/existUser', data);
            }
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        });
});

router.get('/changePassword', function (req, res, next) {
    var bitwebResponse = new BitwebResponse();
    
    let data = {
        title: 'Bitweb exist user'
    };

    controllerUsers.getById(dbconfig.country, req.query.id)
        .then(user => {
            data['userTag'] = user._doc.userTag;
            data['regDate'] = user._doc.regDate;
            if(dbconfig.country =="KR") {
                res.render('v2/login/existUser', data);
            } else {
                res.render('v2_en/login/existUser', data);
            }
        }).catch((err) => {
            console.error('err=>', err)
            bitwebResponse.code = 500;
            bitwebResponse.message = err;
            res.status(500).send(bitwebResponse.create())
        });
});

router.get('/noResult', function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/find/noResult', {title: 'Bitweb find no result'});
    } else{
        res.render('v2_en/find/noResult', {title: 'Bitweb find no result'});
    }
});

router.get("/signupSuccess", sessionChecker.registerSuccessChecker, function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/login/signupSuccess', {title: 'Bitweb sign up success'});
    } else {
        res.render('v2_en/login/signupSuccess', {title: 'Bitweb sign up success'});
    }
});

router.get("/emailAuth", sessionChecker.emailAuthChecker, function (req, res, next) {
    res.render('login/emailAuth', {title: 'Bitweb sign up success', userId: req.session.userId});
});

router.get("/policy", function (req, res, next) {
    res.render('policy/policy', {title: 'Policy'});
});

router.get("/private", function (req, res, next) {
    res.render('policy/private', {title: 'private'});
});

router.get("/teenager", function (req, res, next) {
    res.render('policy/teenager', {title: 'private'});
});

router.get("/naveraf72822281097f80bf131c58b3c9abdb.html", function (req, res, next) {
    res.render('naveraf72822281097f80bf131c58b3c9abdb', {title: 'private'});
});

router.get("/google2def744eaae3698d.html", function (req, res, next) {
    res.render('google2def744eaae3698d', {title: 'private'});
});

router.get('/room', function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/common/vtr', {
            title: 'Bitweb VTR',
            roomToken: req.query.roomToken,
            itemId: req.query.itemId,
            user_id: req.query.user_id,
            vtrTempId: req.query.vtrTempId,
            chatbot_vtr_url: dbconfig.chatbot_vtr_url
        });
    } else {
        res.render('v2_en/common/vtr', {
            title: 'Bitweb VTR',
            roomToken: req.query.roomToken,
            itemId: req.query.itemId,
            user_id: req.query.user_id,
            vtrTempId: req.query.vtrTempId,
            chatbot_vtr_url: dbconfig.chatbot_vtr_url
        });
    }
});

router.get('/sms/room', function (req, res, next) {
    if(dbconfig.country =="KR") {
        res.render('v2/common/vtr_for_sms', {
            title: 'Bitweb VTR',
            roomToken: req.query.roomToken,
            itemId: req.query.itemId,
            user_id: req.query.user_id,
            vtrTempId: req.query.vtrTempId,
            chatbot_vtr_url: dbconfig.chatbot_vtr_url
        });
    } else {
        res.render('v2_en/common/vtr_for_sms', {
            title: 'Bitweb VTR',
            roomToken: req.query.roomToken,
            itemId: req.query.itemId,
            user_id: req.query.user_id,
            vtrTempId: req.query.vtrTempId,
            chatbot_vtr_url: dbconfig.chatbot_vtr_url
        });
    }
});

router.get('/chatbot/login', function (req, res, next) {
    res.render('login/chatbot_login', {title: 'Bitweb Main', chatbot_url: dbconfig.chatbot_url});
});

router.get("/checkUrl", sessionChecker.sessionChecker3, function (req, res, next) {
    let cookie_data = req.cookies.key;
    let start = cookie_data.indexOf("orange__F");
    let cValue = '';
    if(start != -1) {
        start += "orange__F".length;
        var end = cookie_data.indexOf(';', start);
        if (end == -1) end = cookie_data.length;
        cValue = cookie_data.substring(start, end);
        res.redirect(dbconfig.chatbot_url + '?cmod=cs&orange__F' + cValue);
    } else {
        res.redirect("/chatbot/login");
    }
});

router.get('/users/info/:trader', function (req, res, next) {
    let trader = req.params.trader;
    res.end(trader);
});

router.get('/naverLoginCallback', function (req, res, next) {
    code = req.query.code;
    state = req.query.state;
    api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
        + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
    
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let parse_token_body = JSON.parse(body);
            options = {
                url: "https://openapi.naver.com/v1/nid/me",
                headers: {"Authorization":"Bearer " + parse_token_body.access_token}
            };
            //To-Do : 네이버 user 초회
            request.get(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let parse_user_body = JSON.parse(body);
                    //To-Do : users에 저장
                    var bitwebResponse = new BitwebResponse();
                    let country = dbconfig.country;
                    console.log(parse_token_body.access_token, parse_user_body);
                    let email = parse_user_body.response.email;

                    controllerUsers.getByUserEmail(country, email)
                        .then(result=> {

                            if (result != null) {
                                req.session.userTag = result.userTag;
                                req.session.userId = result._id;
                                req.session.active = result.active;
                                req.session.country = dbconfig.country;
                                res.end("<script>opener.location.href = '/'; window.close();</script>");
                            } else {
                                res.end("<script>opener.location.href = '/signup?userId=' + userId + '&email=' + email; window.close();</script>");
                            }

                        }).catch((err) => {
                        console.error('err=>', err)
                        bitwebResponse.code = 500;
                        bitwebResponse.message = err;
                        res.status(500).send(bitwebResponse.create())
                    });
                } else {
                    res.status(response.statusCode).end();
                    console.log('error = ' + response.statusCode);
                }
            });
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

router.post('/v1/businessContact', function (req, res, next) {
    let bitwebResponse = new BitwebResponse();

    controllerBusinessContacts.add(req)
        .then(result => {
            bitwebResponse.code = 200;
            bitwebResponse.data = result;
            res.status(200).send(bitwebResponse.create())
        }).catch((err) => {
        console.error('err=>', err)
        bitwebResponse.code = 500;
        bitwebResponse.message = err;
        res.status(500).send(bitwebResponse.create())
    })
});

router.get('/reg/auth/start', function (req, res, next) {
    res.render('v2/auth/start', {title: 'Bitweb Main', "okurl":dbconfig.inicis.url + dbconfig.inicis.auth.reg_auth_ok_url, "closeUrl":dbconfig.inicis.url + dbconfig.inicis.auth.closeUrl});
});

router.get('/modify/auth/start', function (req, res, next) {
    res.render('v2/auth/start_modify', {title: 'Bitweb Main', "okurl":dbconfig.inicis.url + dbconfig.inicis.auth.modify_auth_ok_url});
});

router.post('/reg/auth/okurl', function (req, res, next) {
    request({uri: "https://payment.marketmach.com/inicis/decode.php", 
            method:'POST',
            form: req.body, 
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result = JSON.parse(body);
            console.log('success : ', body);
            req.session.birth = result.Socialno;
            req.session.name = result.Name;
            req.session.phone = result.No;
            req.session.sex = result.Sex;
            req.session.commid = result.Commid;
            req.session.foreigner = result.Foreigner;
            req.session.authPhone = true;

            res.render('v2/auth/okurl', result);
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

router.post('/modify/auth/okurl', function (req, res, next) {
    request({uri: "https://payment.marketmach.com/inicis/decode.php", 
            method:'POST',
            form: req.body, 
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result = JSON.parse(body);
            console.log('success : ', body);
            req.session.birth = result.Socialno;
            req.session.name = result.Name;
            req.session.phone = result.No;
            req.session.sex = result.Sex;
            req.session.commid = result.Commid;
            req.session.foreigner = result.Foreigner;
            req.session.authPhone = true;

            res.render('v2/auth/okurl_modify', result);
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

router.get('/getPhone', function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    bitwebResponse.code = 200;
    bitwebResponse.data = {
        "authPhone":req.session.authPhone,
        "phone":req.session.phone,
        "userName": req.session.name,
        "birth": req.session.birth,
        "sex": req.session.sex,
        "commId": req.session.commid,
        "foreigner": req.session.foreigner
    };
    res.status(200).send(bitwebResponse.create())
})

router.post('/fileuploads',  function (req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let country = dbconfig.country;
    let awsS3 = require('../utils/awsS3');
    let multiUpload = awsS3.multiUpload();

    multiUpload(req, res, function (err, result) {
        if (err) {
            res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
            return;
        }

        console.log('req.file=>', JSON.stringify(req.files))
        let data = {
            "images": []
        }
        for(var i =0; i< req.files.length; i++) {
            let image = {
                "path": req.files[i].location,
                "bucket": req.files[i].bucket,
                "key": req.files[i].key,
                "origin_name": req.files[i].originalname,
                "size": req.files[i].size,
                "mimetype": req.files[i].mimetype,
                "regDate": util.formatDate(new Date().toLocaleString('ko-KR'))
            }

            data['images'].push(image);
        }

        bitwebResponse.code = 200;
        bitwebResponse.data = data;
        res.status(200).send(bitwebResponse.create())
    });
});

function eventDay(req, res, next) {

    let currentTime = createCurrentUnixTime();
    let firstStartDay = '2018-10-31 00:00:00'
    let firstEndDay = '2018-11-07 23:59:59'

    let secondStartDay = '2018-11-21 00:00:00'
    let secondEndDay = '2018-11-28 23:59:59'

    let thirdStartDay = '2018-12-12 00:00:00'
    let thirdEndDay = '2018-12-19 23:59:59'

    console.log('currentTime        =>', currentTime)
    console.log('firstStartDay      =>', createUnixTime(firstStartDay))
    console.log('firstEndDay        =>', createUnixTime(firstEndDay))

    switch (true) {
        case ((createUnixTime(firstStartDay) <= currentTime) &&
            (createUnixTime(firstEndDay) >= currentTime)):
            console.log('event term!')
            req.session.preSalesYN = 'Y';
            next();
            break;

        case ((createUnixTime(secondStartDay) <= currentTime) &&
            (createUnixTime(secondEndDay) >= currentTime)):
            console.log('event term!')
            req.session.preSalesYN = 'Y';
            next();
            break;

        case ((createUnixTime(thirdStartDay) <= currentTime) &&
            (createUnixTime(thirdEndDay) >= currentTime)):
            console.log('event term!')
            req.session.preSalesYN = 'Y';
            next();
            break;

        default:
            req.session.preSalesYN = 'N';
            res.redirect('/notsales');
            break;
    }

}

var createCurrentUnixTime = function () {
    let koTime = util.formatDate(new Date().toLocaleString('ko-KR'))
    let pastDateTime = datetime.create(koTime);
    // console.log('koTime=>', koTime)
    // console.log('pastDateTime getTime=>', pastDateTime.getTime())

    return pastDateTime.getTime();
}

var createUnixTime = function (day) {
    let pastDateTime = datetime.create(day);
    return pastDateTime.getTime();
}

module.exports = router;
