var mongoose = require('mongoose');
var later = require('later');
later.date.localTime();
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
    available: [],
    booked: [],
    bookings: [],
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
            return errs.push(new Error('Cannot add empty object as booking.'));
        if (booking.id == null)
            return errs.push(new Error('Booking must have an id.'));
        if (booking.getStart() ==  null || 
            booking.getEnd() == null)
            return errs.push(new Error('Booking must have a start and end time set.'));
        if (this.bookings.indexOf(booking.id) >= 0)
            return errs.push(new Error('Booking ' + booking.id + ' already exists on this spot.'));
        this.bookings.push(booking.id);
    }.bind(this));
    this.save(function(err) {
        errs = errs.length == 0 ? null : errs;
        cb(err || errs);
    });
}

spotSchema.methods.removeBookings = function(bookings, cb) {
    
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

spotSchema.methods.addAvailable = function(sched, cb) {

}

var Spot = mongoose.model('Spot', spotSchema);

module.exports = Spot;
