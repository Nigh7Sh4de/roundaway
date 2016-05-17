var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
    archived: {
        type: Boolean,
        default: false
    },
    spot: {
        type: String,
    },
    start: {
        type: Date
    },
    end: {
        type: Date
    }
});

bookingSchema.methods.setEnd = function(time, cb) {
    if (time == null || typeof time == 'boolean' || time == 0 || time == '')
        return cb(new Error('Cannot set end time. Provided date is empty.'));
    if ((time = new Date(time)) == 'Invalid Date')
        return cb(new Error('Cannot set end time. Provided date is invalid.'));
    this.end = time;
    this.save(cb);
}

bookingSchema.methods.getEnd = function() {
    return this.end;
}

bookingSchema.methods.setDuration = function(dur, cb) {
    if (this.start == null)
        return cb('Cannot set a duration. This booking does not have a start time set.');
    dur = parseFloat(dur);
    if (typeof dur !== 'number' || dur <= 0 || isNaN(dur))
        return cb(new Error('Cannot set duration. Provided duration is invalid.'));
    this.end = new Date(this.start.valueOf() + dur);
    this.save(cb);
}

bookingSchema.methods.getDuration = function() {
    if (this.end == null)
        return new Error('Could not get duration. This booking does not have a start set.');
    if (this.start == null)
        return new Error('Could not get duration. This booking does not have a start set.');
    return this.end - this.start;
}

bookingSchema.methods.setStart = function(time, cb) {
    if (time == null || typeof time == 'boolean' || time == 0 || time == '')
        return cb(new Error('Cannot set start time. Provided date is empty.'));
    if ((time = new Date(time)) == 'Invalid Date')
        return cb(new Error('Cannot set start time. Provided date is invalid.'));
    this.start = time;
    this.save(cb);
}

bookingSchema.methods.getStart = function() {
    return this.start;
}

bookingSchema.methods.setSpot = function(id, cb) {
    if (typeof id === 'object' && id != null)
        id = id.id;
    if (typeof id !== 'string' || id == '')
        return cb(new Error('Cannot set spot for this booking. Provided ID is invalid.'));
    this.spot = id;
    this.save(cb);
}

bookingSchema.methods.getSpot = function() {
    if (this.spot != null)
        return this.spot;
    else
        return new Error('This booking does not have a spot associated with it.');
}

bookingSchema.methods.archive = function(cb) {
    this.archived = true;
    this.save(cb);
}

var Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
