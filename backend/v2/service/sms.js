let AWS = require('aws-sdk');
let credentials = require('../../../config/aws-credentials');

let request = require('request-promise-native');
let config = require('../../../config/sms');
let CryptoJS = require('crypto-js');

function sendSms(phone, message) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => {
            // Set region
            // AWS.config.update({
            //     accessKeyId: credentials.s3.accessKeyId,
            //     secretAccessKey: credentials.s3.secretAccessKey,
            //     region: credentials.sns.region
            // });

            // let params = {
            //     Message: message,    //Message
            //     PhoneNumber: phone,  //전화번호
            // };

            // Create promise and SNS service object
            // var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

            // Handle promise's fulfilled/rejected states
            // publishTextPromise.then((data) => {
            //     console.log("MessageID is " + data.MessageId);
            //     resolve('success');
            // }).catch((err) => {
            //     console.error(err, err.stack);
            //     resolve('fail');
            // });

            /* Naver SMS service */
            var phoneList = new Array();
            phoneList.push(phone.substring(3));

            var body = {
            };

            let option = {
                uri:config.naverSMSAPI,
                method:"POST",
                headers:{
                    "Content-Type":"application/json; charset-utf-8",
                    "x-ncp-auth-key":config.naverAccessId,
                    "x-ncp-service-secret":config.naverSMSSecretKey
                },
                body:{
                    "type":"sms",
                    "contentType":"COMM",
                    "countryCode":"82",
                    "from":config.naverSMSSenderPhoneNumber,
                    "subject":"",
                    "content":message,
                    "to":phoneList
                },
                json:true
            }

            // message send
            request(option, function(err, res, body){
                console.log("SMS Send fail : " + body.error);
                resolve('fail');
            });
        });
    });
}

function makeSignature(body) {

    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, config.naverAPISecretKey);
    hmac.update(body);
 
    var hash = hmac.finalize();
 
    return hash.toString(CryptoJS.enc.Base64);
 }

exports.sendSms = sendSms;