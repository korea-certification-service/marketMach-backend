var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var pointsSchema = new Schema({
    point: Number,
    price: Number,
    type: String,
    pointId: String,
    regDate: String
});


module.exports = mongoose.model('Pointbankhistorys', pointsSchema);