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
            var body = {
                "type":"SMS",
                "contentType":"COMM",
                "countryCode":"82",
                "from":config.naverSMSSenderPhoneNumber,
                "content":message,
                "messages":[
                    {
                        "to":phone,
                        "content":message,
                    }
                ]
            };

            var signature = makeSignature(body);

            var option = {
                uri:config.naverSMSAPI,
                method:"POST",
                headers:{
                    "Content-Type":"application/json; charset-utf-8",
                    "x-ncp-apigw-timestamp":Date.now(),
                    "x-ncp-iam-access-key":config.naverAccessId,
                    "x-ncp-apigw-signature-v2":signature
                },
                body:body,
                json:true
            }

            // message send
            request(option).then(
                    // (data) => {
                    //     console.log("Request ID : " + body.requestId);
                    //     resolve('success');
                // }
                ).catch(
                    (err) => function(){
                        console.log("SMS Send fail : " + err);
                        resolve('fail');
                    }
                );
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