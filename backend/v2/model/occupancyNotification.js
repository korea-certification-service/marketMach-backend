var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var occupancyNotificationsSchema = new Schema({
    sendSmsNotification: Boolean,
    phones: Mixed,
    regDate: String
});

module.exports = mongoose.model('occupancyNotifications', occupancyNotificationsSchema);