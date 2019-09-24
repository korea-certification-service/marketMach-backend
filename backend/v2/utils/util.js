function formatDate (date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minutes = d.getMinutes(),
        secounds = d.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.toString().length < 2) hour = '0' + hour;
    if (minutes.toString().length < 2) minutes = '0' + minutes;
    if (secounds.toString().length < 2) secounds = '0' + secounds;

    let getDate = [year, month, day].join('/');
    let getTime = [hour, minutes, secounds].join(':');
    return getDate + " " + getTime;
}

function formatDate2 (date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minutes = d.getMinutes(),
        secounds = d.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.toString().length < 2) hour = '0' + hour;
    if (minutes.toString().length < 2) minutes = '0' + minutes;
    if (secounds.toString().length < 2) secounds = '0' + secounds;

    let getDate = [year, month, day].join('');
    let getTime = [hour, minutes, secounds].join('');
    return getDate + getTime;
}

function getUnixTime(date) {
    var d = new Date(date);
    return d.getTime() / 1000;
}

function formatDatePerHour (date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minutes = '00',
        secounds = '00';

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.toString().length < 2) hour = '0' + hour;
    
    let getDate = [year, month, day].join('/');
    let getTime = [hour, minutes, secounds].join(':');
    return getDate + " " + getTime;
}

function checkAdult (start_date, to_date) {
    var s_d = new Date(start_date);
    var e_d = new Date(to_date);
    
    var s_year = s_d.getFullYear();
    var e_year = e_d.getFullYear();
    
    var diff = e_year - s_year; 
    //console.log(s_year, e_year, diff);
    return diff;
}

function getEnvLocale(env) {
    env = env || process.env;

    return env;
    // return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
}

function calculateDate (date, interval_type, interval) {
    var d = new Date(date),
        month = (interval_type == "M" ? '' + (d.getMonth() + 1 + interval) :  '' + (d.getMonth() + 1)),
        day = (interval_type == "D" ? '' + (d.getDate() + interval) :  '' + d.getDate()),
        year = d.getFullYear() + (interval_type == "Y" ? interval : ""),
        hour = d.getHours() + (interval_type == "h" ? interval : ""),
        minutes = d.getMinutes() + (interval_type == "m" ? interval : ""),
        secounds = d.getSeconds() + (interval_type == "s" ? interval : "");

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.toString().length < 2) hour = '0' + hour;
    if (minutes.toString().length < 2) minutes = '0' + minutes;
    if (secounds.toString().length < 2) secounds = '0' + secounds;

    let getDate = [year, month, day].join('/');
    let getTime = [hour, minutes, secounds].join(':');
    return getDate + ' ' + getTime;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function makeToken()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function isNull(value) {
    if(value == "") {
        return false;
    }
    return true;
}

function checkStrNum(value) {
    let idReg = /^[A-Za-z0-9]{4,12}$/g;
    if( !idReg.test( value ) ) {
        return false;
    }
    return true;
}

function checkPassword(value) {
    let idReg = /^.*(?=.{8,16})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    if( !idReg.test( value ) ) {
        return false;
    }
    return true;
}

function checkEmail(value) {
    let idReg = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
    if( !idReg.test( value ) ) {
        return false;
    }
    return true;
}

function fileUpload(req, res, callback) {
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

        for(var i=0; i<data['images'].length; i++) {
            if(data['images'][i] == null) {
                data['images'].splice(i,1);
                i--;
            }
        }

        callback(data);
    });
}

function makeNumber() {
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.formatDate = formatDate;
exports.formatDate2 = formatDate2;
exports.getEnvLocale = getEnvLocale;
exports.numberWithCommas = numberWithCommas;
exports.makeToken = makeToken;
exports.calculateDate = calculateDate;
exports.isNull = isNull;
exports.checkStrNum = checkStrNum;
exports.checkPassword = checkPassword;
exports.checkEmail = checkEmail;
exports.checkAdult = checkAdult;
exports.fileUpload = fileUpload;
exports.makeNumber = makeNumber;
exports.formatDatePerHour = formatDatePerHour;
exports.getUnixTime = getUnixTime;