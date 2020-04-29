let AWS = require('aws-sdk');
let credentials = require('../../../config/aws-credentials');

let request = require('request');
let config = require('../../../config/sms');
// let crytpJsHMAC = require('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/hmac-sha256.min.js');
// let crytpJsENC = require('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/enc-base64.min.js');

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

            var signature = makeSignature(config.naverSMSAPI);

            var option = {
                uri:config.naverSMSAPI,
                method:"POST",
                headers:{
                    "Content-Type":"application/json; charset-utf-8",
                    "x-ncp-apigw-timestamp":Date.now(),
                    "x-ncp-iam-access-key":config.naverAccessId,
                    "x-ncp-apigw-signature-v2":signature
                },
                form: {
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
                },
                json:true
            }

            // message send
            request.post(option,
                function(err, res, body){
                    if(body.statusCode == "202"){
                        console.log("Request ID : " + body.requestId);
                        resolve('success');
                    }
                    else{
                        console.log("SMS Send fail : " + body.statusCode);
                        resolve('fail');
                    }
                }
            );
        });
    });
}

function makeSignature(uri) {
    var space = " ";            // one space
    var newLine = "\n";            // new line
    var method = "POST";            // method
    var url = uri;   // url (include query string)
    var timestamp = Date.now();         // current timestamp (epoch)
    var accessKey = config.naverAccessId;         // access key id (from portal or Sub Account)
    var secretKey = config.naverAPISecretKey;         // secret key (from portal or Sub Account)

    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
    hmac.update(method);
    hmac.update(space);
    hmac.update(url);
    hmac.update(newLine);
    hmac.update(timestamp);
    hmac.update(newLine);
    hmac.update(accessKey);
 
    var hash = hmac.finalize();
 
    return hash.toString(CryptoJS.enc.Base64);
 }

exports.sendSms = sendSms;