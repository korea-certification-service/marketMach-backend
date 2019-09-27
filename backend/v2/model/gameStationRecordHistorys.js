var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameCenterRecordHistorysSchema = new Schema({
    gameCenterId: String,
    service: String,
    lastStageLevel: Number,
    isLastStage: Boolean,
    userRecordInfo:[],
    deviceId: String,
    cn: Number,
    regDate: String
});

module.exports = mongoose.model('gameCenterRecordHistorys', gameCenterRecordHistorysSchema);
