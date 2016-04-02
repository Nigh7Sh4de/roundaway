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
    duration: {
        type: Number
    }
});

bookingSchema.methods.setEndTime = function(time, cb) {
    if (!(time instanceof Date))
        return cb(new Error('Cannot set end time. Provided date is invalid.'));
    this.duration = time - this.start;
    this.save(cb);
}

bookingSchema.methods.getEndTime = function() {
    var start = this.getStartTime();
    if (start instanceof Error)
        return start;
    var duration = this.getDuration();
    if (duration instanceof Error)
        return duration;
    return new Date(start.valueOf() + duration);
    
}

bookingSchema.methods.setDuration = function(dur, cb) {
    if (typeof dur !== 'number' || dur <= 0)
        return cb(new Error('Cannot set duration. Provided duration is invalid.'));
    this.duration = dur;
    this.save(cb);
}

bookingSchema.methods.getDuration = function() {
    if (this.duration != null)
        return this.duration;
    else
        return new Error('This booking does not have a duration set.');
}

bookingSchema.methods.setStartTime = function(time, cb) {
    if (!(time instanceof Date))
        return cb(new Error('Cannot set start time. Provided date is invalid.'));
    this.start = time;
    this.save(cb);
}

bookingSchema.methods.getStartTime = function() {
    if (this.start != null)
        return this.start;
    else
        return new Error('This booking does not have a start time set.');
}

bookingSchema.methods.setSpotId = function(id, cb) {
    if (typeof id !== 'string' || id == '')
        return cb(new Error('Cannot set spot for this booking. Provided ID is invalid.'));
    this.spot = id;
    this.save(cb);
}

bookingSchema.methods.getSpotId = function() {
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
