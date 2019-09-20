var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var occupancyPhonesSchema = new Schema({
    country: String,
    countryCode: String,
    phone: String,
    authCode: String,
    regDate: String
});

module.exports = mongoose.model('OccupancyPhones', occupancyPhonesSchema);