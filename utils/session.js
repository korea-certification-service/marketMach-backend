var sessionChecker = (req, res, next) => {
    console.log('sessionID =>', req.sessionID);
    console.log('session.userTag =>', req.session.userTag);
    console.log("session.active =>",req.session.active);
    console.log('session.userId =>', req.session.userId);

    if (req.session.userTag && req.cookies.bitweb_sid) {
        if(req.originalUrl === "/") {
            res.redirect("/dashboard");
        } else {
            next();
        }
    }else {
        //로그인 안한 경우
        res.redirect("/login");
    }
};
var emailAuthChecker = (req, res, next) => {
    console.log('sessionID =>', req.sessionID);
    console.log('session.userTag =>', req.session.userTag);
    console.log("session.active =>",req.session.active);
    console.log('session.userId =>', req.session.userId);

    if (req.session.userTag && req.cookies.bitweb_sid) {
        //로그인한 경우
        if(req.session.active===false){
            //이메일인증 안한 경우
            next();
        }else{
            //이메일 인증 한 경우
            res.redirect("/myPages/myInfo");
        }
    }else {
        //로그인 안한 경우
        res.redirect("/login");
    }
};
var registerSuccessChecker = (req, res, next) => {
    console.log('sessionID =>', req.sessionID);
    console.log('session.userTag =>', req.session.userTag);
    console.log("session.active =>",req.session.active);
    console.log('session.userId =>', req.session.userId);

    if (req.session.userTag && req.cookies.bitweb_sid) {
        //로그인한 경우
        next()
    }else {
        //로그인 안한 경우
        res.redirect("/login");
    }
};

exports.sessionChecker=sessionChecker;
exports.emailAuthChecker=emailAuthChecker;
exports.registerSuccessChecker=registerSuccessChecker;
