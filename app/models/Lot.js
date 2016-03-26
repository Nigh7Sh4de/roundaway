var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lotSchema = new Schema();

var Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
