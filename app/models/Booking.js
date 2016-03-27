var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingSchema = new Schema();

var Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
