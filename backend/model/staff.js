var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var StaffSchema = require('../dao/staff');

module.exports = mongoose.model('Staffs', StaffSchema);
