var ranger = require('rangerjs');
var mongoose = require('mongoose');
var later = require('later');
later.date.localTime();
var Schema = mongoose.Schema;

var spotSchema = new Schema({
    address: String,
    location: {
        coordinates: {
            type: [Number],
            index: '2d'
        }//{
            
            // type: [Number],  // [<longitude>, <latitude>]
            // index: '2d'      // create the geospatial index
        // }
    },
    available: {
        type: [ranger.Range(Date)],
        get: function(data) {
            try {
                return new ranger(data);
            } catch(e) {
                console.error(e);
                return data;
            }
        },
        set: function(data) {
            return data.ranges || data;
        }
    },
    booked: {
        type: [ranger.Range(Date)],
        get: function(data) {
            try {
                return new ranger(data);
            } catch(e) {
                console.error(e);
                return data;
            }
        },
        set: function(data) {
            return data.ranges || data;
        }
    },
    bookings: [String],
    lot: String,
    number: Number
});

spotSchema.methods.getAddress = function() {
    return this.address;
}

spotSchema.methods.setAddress = function(address, cb) {
    if (typeof address !== 'string' || address == '')
        return cb(new Error('Cannot set address. Provided address is invlaid.'));
    this.address = address;
    this.save(cb);
}

spotSchema.methods.getLocation = function() {
    return Object.assign([], this.location.coordinates, {
        long: this.location.coordinates[0],
        lat: this.location.coordinates[1]
    });
}

spotSchema.methods.setLocation = function(location, cb) {
    if (location instanceof Array) {
        if (location.length != 2)
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        var long = parseFloat(location[0]);            
        var lat = parseFloat(location[1]);            
        if (isNaN(long) ||
            isNaN(lat))
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        this.location.coordinates = [long, lat];
    }
    else {
        if (typeof location !== 'object' || location == null)
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        location.long = parseFloat(location.long);
        location.lon = parseFloat(location.lon);
        location.lat = parseFloat(location.lat);
        if (isNaN(location.long))
            location.long = location.lon;
        if (isNaN(location.long) ||
            isNaN(location.lat))
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        this.location.coordinates = [location.long, location.lat];
    }
    this.save(cb);
}

spotSchema.methods.getBookings = function() {
    return this.bookings;
}

spotSchema.methods.addBookings = function(bookings, cb) {
    if (!(bookings instanceof Array))
        bookings = [bookings];
    var errs = [];
    bookings.forEach(function(booking) {
        if (booking == null)
            return errs.push('Cannot add empty object as booking.');
        if (booking.id == null)
            return errs.push('Booking must have an id.');
        if (booking.getStart() ==  null || 
            booking.getEnd() == null)
            return errs.push('Booking must have a start and end time set.');
        if (this.bookings.indexOf(booking.id) >= 0)
            return errs.push('Booking ' + booking.id + ' already exists on this spot.');
        if (!this.available.checkRange(booking.start, booking.end))
            return errs.push('Cannot add booking. The specified time range is not available for this spot: ' + booking.start + ' ~ ' + booking.end);
        this.bookings.push(booking.id);
        this.booked.addRange(booking.start, booking.end);
        this.available.removeRange(booking.start, booking.end);
    }.bind(this));
    this.save(function(err) {
        errs = errs.length == 0 ? null : errs;
        cb(err || errs);
    });
}

spotSchema.methods.removeBookings = function(bookings, cb) {
    if (!(bookings instanceof Array))
        bookings = [bookings];
    var errs = [];
    var removed = [];
    bookings.forEach(function(booking) {
        if (booking == null)
            return errs.push(new Error('Cannot remove null booking.'));
        if (booking.id == null)
            return errs.push(new Error('Cannot remove booking. Booking must have an id.'));
        var index = this.bookings.indexOf(booking.id);
        if (index < 0)
            return errs.push(new Error('Cannot remove booking. This booking is not assoaciated with this spot'));
        removed = removed.concat(this.bookings.splice(index, 1));
        this.booked.removeRange(booking.start, booking.end);
        this.available.addRange(booking.start, booking.end);
    }.bind(this));
    this.save(function (err) {
        errs = errs.length == 0 ? null : errs;
        cb(err || errs, removed);
    });
}

spotSchema.methods.getNumber = function() {
    return this.number;
}

spotSchema.methods.setNumber = function(num, cb) {
    var error = setNumber.bind(this)(num);
    if (error != null)
        return cb(error);
    this.save(cb);
}

spotSchema.methods.removeNumber = function(cb) {
    this.number = null;
    this.save(cb);
}

spotSchema.methods.getLot = function() {
    return this.lot;
}

spotSchema.methods.setLot = function(lot, cb) {
    var error = setLot.bind(this)(lot);
    if (error != null)
        return cb(error);
    this.save(cb);
}

spotSchema.methods.removeLot = function(cb) {
    this.lot = null;
    this.save(cb);
}

spotSchema.methods.setLotAndNumber = function(lot, num, cb) {
    var error = null;
    error = setLot.bind(this)(lot);
    if (error != null)
        return cb(error);
    error = setNumber.bind(this)(num);
    if (error != null)
        return cb(error);
    this.save(cb);
}

var setLot = function(lot) {
    if (typeof lot === 'object' && lot != null)
        lot = lot.id;
    if (typeof lot !== 'string')
        return new Error('Cannot set lot. Lot id is invalid.');
    this.lot = lot;
}

var setNumber = function(num) {
    if (typeof num !== 'number')
        return new Error('Cannot set number. Number is invalid.');
    this.number = num;
}

spotSchema.methods.addAvailability = function(sched, cb) {
    if (!(sched instanceof Array)) {
        if (sched == null)
            return cb(new Error('Cannot add null schedule to availability.'));
        if (sched.start == null || sched.end == null)
            return cb(new Error('Cannot add availablility. Must have start and end times for each range.'));
        sched = [sched];
    }
    var errs = [];
    for (var i=0; i < sched.length; i++) {
        var start = new Date(sched[i].start),
            end = new Date(sched[i].end);
        if (isNaN(start.valueOf()) || isNaN(end.valueOf()))
            errs.push(new Error('Cannot add availability range: ' + sched[i].start + ' ~ ' + sched[i].end));
        else if (sched[i].interval && (sched[i].count || sched[i].finish))
            this.available.addRecuringRange(start, end, sched[i].interval, sched[i].count, new Date(sched[i].finish));
        else
            this.available.addRange(start, end);
    }
    this.markModified('available');
    this.save(function(err) {
        errs = errs.length == 0 ? null : errs;
        cb(err || errs);
    });
}

spotSchema.methods.removeAvailability = function(sched, cb) {
    if (!(sched instanceof Array)) {
        if (sched == null)
            return cb(new Error('Cannot remove null schedule from availability.'));
        if (sched.start == null || sched.end == null)
            return cb(new Error('Cannot remove availablility. Must have start and end times for each range to remove.'));
        sched = [sched];
    }
    var errs = [];
    for (var i=0; i < sched.length; i++) {
        var start = new Date(sched[i].start),
            end = new Date(sched[i].end);
        if (isNaN(start.valueOf()) || isNaN(end.valueOf()))
            errs.push(new Error('Cannot remove availability range: ' + sched[i].start + ' ~ ' + sched[i].end));
        else if (sched[i].interval && (sched[i].count || sched[i].finish))
            this.available.removeRecuringRange(start, end, sched[i].interval, sched[i].count, new Date(sched[i].finish));
        else
            this.available.removeRange(start, end);
    }
    this.markModified('available');
    this.save(function(err, obj) {
        errs = errs.length == 0 ? null : errs;
        cb(err || errs);
    });
}

var Spot = mongoose.model('Spot', spotSchema);

module.exports = Spot;
