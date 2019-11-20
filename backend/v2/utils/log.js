/**
 * 서비스 LOG 파일 생성 모듈 (logs 폴더에 기록)
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-11
 */
var winston = require('winston'); 
require('winston-daily-rotate-file');
require('date-utils');
var fs = require('fs');
var logDir = 'logs';
if (!fs.existsSync(logDir)) { 
    fs.mkdirSync(logDir); 
}

var logger = winston.createLogger({ 
    transports: [ 
        new winston.transports.DailyRotateFile({
            filename : 'logs/marketmach-backend.log', // log 폴더에 system.log 이름으로 저장
            zippedArchive: true, // 압축여부
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        }),
        // 콘솔 출력
        new winston.transports.Console({
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        })
    ] 
});

function addLog(country, url, reqData, resData) {
    logger.info('===============================');
    logger.info('country' + ':' + country);
    logger.info('url' + ':' + url);
    logger.info('reqData :' + JSON.stringify(reqData));
    logger.info('resData :' + (typeof(resData) == "object" ? JSON.stringify(resData) : resData));
    logger.info('===============================');
}

exports.addLog = addLog;