/**
 * Util 모듈
 * 작성자 : Chef Kim
 * 작성일 : 2019-11-20
 */

 //Date format 변환 함수(YYYY/MM/DD HH:MI:SS)
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

//Date format 변환 함수(YYYYMMDDHHMISS)
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

//Date를 unixtime으로 변환 함수
function getUnixTime(date) {
    var d = new Date(date);
    return d.getTime() / 1000;
}

//분 단위 계산 함수
function formatDatePerMin (date, min) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minutes = (d.getMinutes() - min),
        secounds = '00';

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.toString().length < 2) hour = '0' + hour;
    
    let getDate = [year, month, day].join('/');
    let getTime = [hour, minutes, secounds].join(':');
    return getDate + " " + getTime;
}

//시간 단위 계산 함수
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

//일 단위 계산 함수
function formatDatePerDay (date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = "00",
        minutes = '00',
        secounds = '00';

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.toString().length < 2) hour = '0' + hour;
    
    let getDate = [year, month, day].join('/');
    let getTime = [hour, minutes, secounds].join(':');
    return getDate + " " + getTime;
}

//성인 여부 확인 함수(현재 사용 안함)
function checkAdult (start_date, to_date) {
    var s_d = new Date(start_date);
    var e_d = new Date(to_date);
    
    var s_year = s_d.getFullYear();
    var e_year = e_d.getFullYear();
    
    var diff = e_year - s_year; 
    //console.log(s_year, e_year, diff);
    return diff;
}

//언어 설정 함수(현재 사용 안함)
function getEnvLocale(env) {
    env = env || process.env;

    return env;
    // return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
}

//날짜 계산
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

//금액에 콤마 표시 함수
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Token 생성 함수
function makeToken()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//validation - Null 체크
function isNull(value) {
    if(value == "") {
        return false;
    }
    return true;
}

//validation - 숫자/문자 체크
function checkStrNum(value) {
    let idReg = /^[A-Za-z0-9]{4,12}$/g;
    if( !idReg.test( value ) ) {
        return false;
    }
    return true;
}

//validation - 패스워드 체크
function checkPassword(value) {
    let idReg = /^.*(?=.{8,16})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    if( !idReg.test( value ) ) {
        return false;
    }
    return true;
}

//validation - 이메일 체크
function checkEmail(value) {
    let idReg = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
    if( !idReg.test( value ) ) {
        return false;
    }
    return true;
}

//파일 업로드 (현재 사용 안함)
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

//랜덤한 번호 6자리 생성(인증번호 사용 중)
function makeNumber() {
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//거래 상태 표시 함수
function getStatus(value) {
    if(value == 0) {
        return {
            'text': '거래가능',
            'number': 1,
            'className': 'todo',
            'detail': '거래가능'
        };
    } else if((value >= 1 && value <= 3) || (value >= 101 && value <= 103)) {
        var detail = "거래요청";
        if(value == 2 || value == 102) {
            detail = "구매확인";
        } else if(value == 3 || value == 103) {
            detail = "판매완료";
        } 
        return {
            'text': '거래중',
            'number': 2,
            'className': 'doing',
            'detail': detail
        };
    } else if(value == 4 || value == 6 || value == 7 || value == 104 || value == 106 || value == 107) {
        var detail = "거래완료";
        if(value == 6 || value == 106) {
            detail = "거래완료(관리자)";
        } else if(value == 7 || value == 107) {
            detail = "거래완료(시스템)";
        } 
        return {
            'text': '거래완료',
            'number': 3,
            'className': 'done',
            'detail': detail
        };
    } else if(value == 5 || value == 105) {
        //return '이의재기';
        return {
            'text': '이의제기',
            'number': 3,
            'className': 'done',
            'detail': '이의제기'
        };
    } else if(value == 50) {
        return {
            'text': '거래중',
            'number': 2,
            'className': 'doing',
            'detail': '대화중'
        };
    } else {
        return {
            'text': '거래불가',
            'number': 3,
            'className': 'done',
            'detail': '거래불가'
        };
    }
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
exports.formatDatePerDay = formatDatePerDay;
exports.formatDatePerMin = formatDatePerMin;
exports.getUnixTime = getUnixTime;
exports.getStatus = getStatus;