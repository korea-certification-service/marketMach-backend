let AWS = require('aws-sdk');
let credentials = require('../../../config/aws-credentials');

function sendSms(phone, message) {
    return new Promise((resolve, reject) => {
        // Set region
        AWS.config.update({
            accessKeyId: credentials.s3.accessKeyId,
            secretAccessKey: credentials.s3.secretAccessKey,
            region: credentials.sns.region
        });

        let params = {
            Message: message,    //Message
            PhoneNumber: phone,  //전화번호
        };

        // Create promise and SNS service object
        var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

        // Handle promise's fulfilled/rejected states
        publishTextPromise.then((data) => {
            console.log("MessageID is " + data.MessageId);
            resolve('success');
        }).catch((err) => {
            console.error(err, err.stack);
            resolve('fail');
        });
    });
}

exports.sendSms = sendSms;