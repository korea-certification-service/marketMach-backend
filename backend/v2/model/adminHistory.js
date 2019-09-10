var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var adminHistoriesSchema = new Schema({
    staffTag: String,
    beforeDoc: Object,
    afterDoc: Object,
    regDate: Date
});

module.exports = mongoose.model('adminHistories', adminHistoriesSchema);
