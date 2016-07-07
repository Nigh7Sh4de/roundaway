var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Price = require('./Price');
var Enum = require('./Enum');

var statusEnum = new Enum(['unpaid', 'paid', 'archived']);

var bookingSchema = new Schema({
    spot: {
        type: Schema.Types.ObjectId,
        ref: 'Spot'
    },
    status: {
        type: 'string',
        enum: Object.keys(statusEnum),
        default: Object.keys(statusEnum)[0]
    },
    price: Price,
    start: Date,
    end: Date,
});

bookingSchema.methods.setEnd = function(time, cb) {
    if (time == null || typeof time == 'boolean' || time == 0 || time == '')
        return cb('Cannot set end time. Provided date is empty.');
    if ((time = new Date(time)) == 'Invalid Date')
        return cb('Cannot set end time. Provided date is invalid.');
    this.end = time;
    this.save(cb);
}

bookingSchema.methods.getEnd = function() {
    return this.end;
}

bookingSchema.methods.setDuration = function(dur, cb) {
    if (!this.start)
        return cb('Cannot set a duration. This booking does not have a start time set.');
    dur = parseFloat(dur);
    if (typeof dur !== 'number' || dur <= 0 || isNaN(dur))
        return cb('Cannot set duration. Provided duration is invalid.');
    this.end = new Date(this.start.valueOf() + dur);
    this.save(cb);
}

bookingSchema.methods.getDuration = function() {
    if (!this.end)
        return null;
    if (!this.start)
        return null;
    return this.end - this.start;
}

bookingSchema.methods.setStart = function(time, cb) {
    if (time == null || typeof time == 'boolean' || time == 0 || time == '')
        return cb('Cannot set start time. Provided date is empty.');
    if ((time = new Date(time)) == 'Invalid Date')
        return cb('Cannot set start time. Provided date is invalid.');
    this.start = time;
    this.save(cb);
}

bookingSchema.methods.getStart = function() {
    return this.start;
}

bookingSchema.methods.setSpot = function(spot, cb) {
    if (typeof spot !== 'object' || !spot)
        return cb('Cannot set spot for this booking because the spot provided is not a valid object');
    if (!spot.id)
        return cb('Cannot set spot for this booking because the spot provided does not have a valid id');
    if (!spot.getPrice().perHour)
        return cb('Cannot set spot for this booking because the spot provided does not have a set price');
    this.spot = spot.id;
    var onehour = 1000*60*60;
    this.price = spot.getPrice().perHour * this.getDuration() / onehour;
    this.save(cb);
}

bookingSchema.methods.getSpot = function() {
    return this.spot || null;
}

bookingSchema.methods.getPrice = function() {
    return this.price || null;
        
}

bookingSchema.methods.archive = function(cb) {
    this.status = statusEnum.archived;
    this.save(cb);
}

bookingSchema.methods.pay = function(cb) {
    this.status = statusEnum.paid;
    this.save(cb);
}

bookingSchema.statics.status = statusEnum;

var Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
