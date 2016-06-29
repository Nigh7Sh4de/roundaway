var ranger = require('rangerjs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Price = require('./Price');
var Range = require('./Range');

var spotSchema = new Schema({
    address: String,
    price: {
        perHour: Price
    },
    location: {
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },
    available: Range(Date),
    booked: Range(Date),
    bookings: [String],
    lot: String,
    number: Number
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

spotSchema.virtual('available.next').get(function() {
    return this.available.nextRange(new Date());
})

spotSchema.methods.getPrice = function() {
    var price = {},
        _price = this.price.toJSON();
    if (Object.keys(_price).length == 0)
        return null;
    for (var type in _price)
        price[type] = this.price[type];
    return price;
}

spotSchema.methods.setPrice = function(price, cb) {
    if (typeof price !== 'object' || !price)
        return cb('Could not set price because this price object is invalid')
    for (var type in price) {
        var p = parseFloat(price[type]);
        if (isNaN(p))
            cb('Cannot set price as the supplied price is not a valid number: ' + p);
        else
            this.price[type] = p;
    }
    this.save(cb);
}

spotSchema.methods.setPricePerHour = function(price, cb) {
    price = parseFloat(price);
    if (isNaN(price))
        return cb('Cannot set price as the supplied price is not a valid number: ' + price);
    this.price.perHour = price;
    this.save(cb);
}

spotSchema.methods.getAddress = function() {
    return this.address;
}

spotSchema.methods.getLocation = function() {
    return Object.assign([], this.location.coordinates, {
        long: this.location.coordinates[0],
        lat: this.location.coordinates[1]
    });
}

spotSchema.methods.setLocation = function(location, address, cb) {
    if (typeof address !== 'string' || address == '')
        return cb('Cannot set address. Provided address is invlaid.');
    if (location instanceof Array) {
        if (location.length != 2)
            return cb('Cannot set location. Specified coordinates are invalid.');
        var long = parseFloat(location[0]);            
        var lat = parseFloat(location[1]);            
        if (isNaN(long) ||
            isNaN(lat))
            return cb('Cannot set location. Specified coordinates are invalid.');
        location = [long, lat];
    }
    else {
        if (typeof location !== 'object' || location == null)
            return cb('Cannot set location. Specified coordinates are invalid.');
        location.long = parseFloat(location.long);
        location.lon = parseFloat(location.lon);
        location.lat = parseFloat(location.lat);
        if (isNaN(location.long))
            location.long = location.lon;
        if (isNaN(location.long) ||
            isNaN(location.lat))
            return cb('Cannot set location. Specified coordinates are invalid.');
        location = [location.long, location.lat];
    }
    this.location.coordinates = location;
    this.address = address;
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
            return errs.push('Cannot remove null booking.');
        if (booking.id == null)
            return errs.push('Cannot remove booking. Booking must have an id.');
        var index = this.bookings.indexOf(booking.id);
        if (index < 0)
            return errs.push('Cannot remove booking. This booking is not assoaciated with this spot');
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
        return 'Cannot set lot. Lot id is invalid.';
    this.lot = lot;
}

var setNumber = function(num) {
    if (typeof num !== 'number')
        return 'Cannot set number. Number is invalid.';
    this.number = num;
}

spotSchema.methods.addAvailability = function(sched, cb) {
    if (!(sched instanceof Array)) {
        if (sched == null)
            return cb('Cannot add null schedule to availability.');
        if (sched.start == null || sched.end == null)
            return cb('Cannot add availablility. Must have start and end times for each range.');
        sched = [sched];
    }
    var errs = [];
    for (var i=0; i < sched.length; i++) {
            var start = new Date(sched[i].start),
                end = new Date(sched[i].end);
            if (isNaN(start.valueOf()) || isNaN(end.valueOf()) || start >= end)
                errs.push('Cannot add availability range: ' + sched[i].start + ' ~ ' + sched[i].end);
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
            return cb('Cannot remove null schedule from availability.');
        if (sched.start == null || sched.end == null)
            return cb('Cannot remove availablility. Must have start and end times for each range to remove.');
        sched = [sched];
    }
    var errs = [];
    for (var i=0; i < sched.length; i++) {
        var start = new Date(sched[i].start),
            end = new Date(sched[i].end);
        if (isNaN(start.valueOf()) || isNaN(end.valueOf()))
            errs.push('Cannot remove availability range: ' + sched[i].start + ' ~ ' + sched[i].end);
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
