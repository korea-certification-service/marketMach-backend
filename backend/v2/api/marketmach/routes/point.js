/**
 * 공지사항 API(현재 사용 안함)
 * 작성자 : Chef Kim
 * 작성일 : 2019-09-03
 */
var express = require('express');
var router = express.Router();
let BitwebResponse = require('../../../utils/BitwebResponse')
let dbconfig = require('../../../../../config/dbconfig');
let util = require('../../../utils/util');
let token = require('../../../utils/token');
let servicePointHistorys = require('../../../service/pointHistorys');
let logger = require('../../../utils/log');

//point 입금
router.post('/:pointId/deposit', token.checkInternalToken, function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let typeValue = req.body.extType;

    switch(typeValue) {
        case "bank_account":
            //은행 계좌 이체(수동)
            _manualTransfer(req, res, bitwebResponse);
            break;
        default:
            bitwebResponse.code = 500;
            bitwebResponse.message = "요청을 처리할 수 없습니다.";
            res.status(500).send(bitwebResponse.create())
            break;
    }
});

//point 출금
router.post('/:pointId/withdraw', token.checkInternalToken, function(req, res, next) {
    let bitwebResponse = new BitwebResponse();
    let typeValue = req.body.extType;

    switch(typeValue) {
        case "bank_account":
            //은행 계좌 이체(수동)
            _manualTransfer(req, res, bitwebResponse);
            break;
        default:
            bitwebResponse.code = 500;
            bitwebResponse.message = "요청을 처리할 수 없습니다.";
            res.status(500).send(bitwebResponse.create())
            break;
    }
});

async function _manualTransfer(req, res, bitwebResponse) {
    let country = dbconfig.country;
    let body = req.body;
    let fee_rate = body.type == 'deposit' ? dbconfig.fee.point.deposit : dbconfig.fee.point.withdraw;
    
    try {
        let pointHisory = {
            "pointId": req.params.pointId,
            "type":body.type,
            "extType":body.extType,
            "amountCurrency": body.amountCurrency,
            "amount":body.amount,
            "point":body.amount,
            "fee": fee_rate,
            "status": false,
            "userName": body.username,
            "regDate": util.formatDate(new Date().toString())
        }
        if(body.type == "withdraw") {
            pointHisory["bankAccountType"] = body.bankAccountType;
            pointHisory["bankAccount"] = body.bankAccount;
        }
        let addPointHistory = await servicePointHistorys.add(country, pointHisory);                            
        addPointHistory._doc['successYn'] = "Y";
        let resData = {
            "pointHistory": addPointHistory
        }
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, resData);
        
        bitwebResponse.code = 200;
        bitwebResponse.data = Object.assign({}, addPointHistory);
        res.status(200).send(bitwebResponse.create())
    } catch(err) {
        console.error('manualTransfer error =>', err);
        let resErr = "처리중 에러 발생";
        //API 처리 결과 별도 LOG로 남김
        logger.addLog(country, req.originalUrl, req.body, err.message);

        bitwebResponse.code = 500;
        bitwebResponse.message = resErr;
        res.status(500).send(bitwebResponse.create())
    }
}

module.exports = router;