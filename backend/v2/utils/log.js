var winston = require('winston'); 
require('winston-daily-rotate-file');
require('date-utils');
var fs = require('fs');
var logDir = 'logs';
if (!fs.existsSync(logDir)) { 
    fs.mkdirSync(logDir); 
}

const tsFormat = () => (new Date()).toString();

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
    logger.info('reqData' + ':' + reqData);
    logger.info('resData' + ':' + resData);
    logger.info('===============================');
}

exports.addLog = addLog;