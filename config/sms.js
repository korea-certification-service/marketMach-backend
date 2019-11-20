module.exports = {
    //VTR애서 거래 요청 시 사용하는 SMS문구(현재 사용 안함)
    sms: {
        ko: "님이 거래를 요청하였습니다.\n:",
        cn: "VTR交易已经开始。No.:\n",
        POINT: "님이 거래를 요청하였습니다.\n"
    },
    //바로구매 요청 시 사용하는 SMS문구(현재 사용 안함)
    notification: {
        ko: "님이 바로구매를 요청하셨습니다. 구매자님의 금액이 에스크로 되었습니다.\n",
        cn: "VTR我想继续进行交易。\n",
        POINT: "님이 바로구매를 요청하셨습니다. 구매자님의 금액이 에스크로 되었습니다.\n"
    },
    //휴대폰 인증코드 전송 시 사용하는 SMS문구
    authSms: {
        KR: "[MarketMACH]휴대폰인증코드입니다.\n",
        CN: "[MarketMACH]휴대폰인증코드입니다.\n",
        EN: "MarketMACH-The Authentication Code.\n",
        POINT: "[MarketMACH]휴대폰인증코드입니다.\n"
    },
    //관리자에게 보내는 알림 문구
    manageNotification: "시간단위 sms요청이 과도하게 발생.",
    //관리자에게 보내는 알림 문구
    manageWithdrawNotification : "일단위 코인출금이 과도하게 발생.",
};