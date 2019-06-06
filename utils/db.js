var Promise = require('promise');
var mongoose = require('mongoose');
var config = require('../config/dbconfig')
var DB_FILE = config.db.db_name;
var DB_USER = config.db.mongodb_user;

mongoose.Promise = global.Promise;
mongoose.set('debug, true');

function connect (DB_URI) {
    return new Promise((resolve, reject) => {
        if (mongoose.connection.readyState) {
            if(DB_URI.indexOf(mongoose.connection.host +":"+mongoose.connection.port) == -1) {
                mongoose.connection.close()
                mongoose.connect(DB_URI)
                    .then( (connection) => {
                        resolve(connection)
                    })
                    .catch( (err) => {
                        console.error(err)
                        reject(err)
                    })
            } else {
                console.log('reuse connection')
                resolve(mongoose.connection)
            }
        } else {
            console.log('new connection')
            mongoose.connect(DB_URI)
                .then( (connection) => {
                    resolve(connection)
                })
                .catch( (err) => {
                    console.error(err)
                    reject(err)
                })
        }
    })
}

exports.connectDB = function (country) {
    return new Promise((resolve, reject) => {
        let MONGODB_URL = ""
        if (country == "KR") MONGODB_URL = config.db.mongodb_url_kr
        else if (country == "CN") MONGODB_URL = config.db.mongodb_url_cn
        //else if (country == "JP") MONGODB_URL = config.db.mongodb_url_jp
        //else if (country == "EN") MONGODB_URL = config.db.mongodb_url_en

        let DB_URI = 'mongodb://' + DB_USER + MONGODB_URL + '/' + DB_FILE;
        //if ((country == undefined) || (country == "DEV")) DB_URI = 'mongodb://' + MONGODB_URL + '/' + DB_FILE;

        console.log('country=>', country)
        console.log('DB_URI=>', DB_URI)

        connect(DB_URI).then( function (connection) {
            resolve(connection)
        }).catch( function (error) {
            reject(error)
        })
    })
}

exports.close = function () {
    mongoose.connection.close()
}

