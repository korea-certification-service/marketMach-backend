var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var occupancyNotificationsSchema = new Schema({
    type: String,
    phones: Mixed,
    userTag: String,
    regDate: String
});

module.exports = mongoose.model('occupancyNotifications', occupancyNotificationsSchema);