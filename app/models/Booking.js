var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Price = require('./Price');
var Enum = require('./Enum');

var statusEnum = new Enum(['unpaid', 'paid', 'archived']);

var bookingSchema = new Schema({
    spot: {
        type: Schema.Types.ObjectId,
        ref: 'Spot',
        set: function(data) {
            if (typeof data === 'string')
                data = new mongoose.Types.ObjectId(data);
            return data;
        }
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

bookingSchema.methods.getStatus = function() {
    return this.status;
}

bookingSchema.methods.setEnd = function(time) {
    return new Promise(function(resolve, reject) {
        if (time == null || typeof time == 'boolean' || time == 0 || time == '')
            return reject('Cannot set end time. Provided date is empty.');
        if ((time = new Date(time)) == 'Invalid Date')
            return reject('Cannot set end time. Provided date is invalid.');
        this.end = time;
        this.save(function(err, booking) {
            if (err) return reject(err);
            resolve(booking);
        });
    }.bind(this))
}

bookingSchema.methods.getEnd = function() {
    return this.end || null;
}

bookingSchema.methods.setDuration = function(dur) {
    return new Promise(function(resolve, reject) {
        if (!this.start)
            return reject('Cannot set a duration. This booking does not have a start time set.');
        dur = parseFloat(dur);
        if (typeof dur !== 'number' || dur <= 0 || isNaN(dur))
            return reject('Cannot set duration. Provided duration is invalid.');
        this.end = new Date(this.start.valueOf() + dur);
        this.save(function(err, booking) {
            if (err) return reject(err);
            resolve(booking);
        });
    }.bind(this))
}

bookingSchema.methods.getDuration = function() {
    if (!this.end)
        return null;
    if (!this.start)
        return null;
    return this.end - this.start;
}

bookingSchema.methods.setStart = function(time) {
    return new Promise(function(resolve, reject) {
        if (time == null || typeof time == 'boolean' || time == 0 || time == '')
            return reject('Cannot set start time. Provided date is empty.');
        if ((time = new Date(time)) == 'Invalid Date')
            return reject('Cannot set start time. Provided date is invalid.');
        this.start = time;
        this.save(function(err, booking) {
            if (err) return reject(err);
            resolve(booking);
        });
    }.bind(this));
}

bookingSchema.methods.getStart = function() {
    return this.start || null;
}

bookingSchema.methods.setSpot = function(spot) {
    return new Promise(function(resolve, reject) {
        if (typeof spot !== 'object' || !spot)
            return reject('Cannot set spot for this booking because the spot provided is not a valid object');
        if (!spot.id)
            return reject('Cannot set spot for this booking because the spot provided does not have a valid id');
        if (!spot.getPrice() || !spot.getPrice().perHour)
            return reject('Cannot set spot for this booking because the spot provided does not have a set price');
        this.spot = spot.id;
        var onehour = 1000*60*60;
        this.price = spot.getPrice().perHour * this.getDuration() / onehour;
        this.save(function(err, booking) {
            if (err) return reject(err);
            resolve(booking);
        });
    }.bind(this))
}

bookingSchema.methods.getSpot = function() {
    return this.spot || null;
}

bookingSchema.methods.getPrice = function() {
    return this.price || null;
        
}

bookingSchema.methods.archive = function() {
    return new Promise(function(resolve, reject) {
        this.status = statusEnum.archived;
        this.save(function(err, booking) {
            if (err) return reject(err);
            else resolve(booking);
        });
    }.bind(this));
}

bookingSchema.methods.pay = function() {
    return new Promise(function(resolve, reject) {
        this.status = statusEnum.paid;
        this.save(function(err, booking) {
            if (err) return reject(err);
            else resolve(booking);
        });
    }.bind(this));
}

bookingSchema.statics.status = statusEnum;

var Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
