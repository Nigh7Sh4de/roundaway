var mongoose = require('mongoose');
var later = require('later');
var Schema = mongoose.Schema;

var spotSchema = new Schema({
    address: String,
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    available: {
        schedules: []
    },
    booked: {
        schedules: []
    },
    bookings: [],
    lot: String,
    number: Number
});

var Spot = mongoose.model('Spot', spotSchema);

module.exports = Spot;
