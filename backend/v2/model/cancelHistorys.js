var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var cancelHistorysSchema = new Schema({
    vtr: Mixed,
    pointTrade:Mixed,
    item: Mixed,
    from_userId: String,
    to_userId: String,
    refund: Boolean,
    status: String,
    regDate: String
});

module.exports = mongoose.model('CancelHistorys', cancelHistorysSchema);
