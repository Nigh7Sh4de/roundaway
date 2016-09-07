var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = require('mongoose').Types.ObjectId;
var Location = require('./Location');
var Range = require('./Range');
var Price = require('./Price');

var lotSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    attendants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    location: Location,
    price: {
        perHour: Price
    },
    available: Range(Date),
}, {
    timestamps: true
});

lotSchema.methods.addAttendants = function(attendants) {
    return new Promise(function(resolve, reject) {
        attendants = attendants instanceof Array ? attendants : [attendants];
        this.attendants = [...new Set(this.attendants.concat(attendants).map(function(att) {
            if (typeof att === 'string')
                return att;
            if (att instanceof ObjectId)
                return att.toString();
            return att.id || att._id.toString() || att;
        }))];
        this.save(function(err, lot) {
            if (err)
                return reject(err);
            return resolve(lot);
        })
    }.bind(this));
}

lotSchema.methods.getPrice = function() {
    var price = {},
        _price = this.price.toJSON();
    if (Object.keys(_price).length == 0)
        return null;
    for (var type in _price)
        price[type] = this.price[type];
    return price;
}

lotSchema.methods.setPrice = function(price) {
    return new Promise(function(resolve, reject) {
        if (typeof price !== 'object' || !price)
            return reject('Could not set price because this price object is invalid')
        for (var type in price) {
            var p = parseFloat(price[type]);
            if (isNaN(p))
                return reject('Cannot set price as the supplied price is not a valid number: ' + p);
            else
                this.price[type] = p;
        }
        this.save(function(err, lot) {
            if (err) return reject(err);
            resolve(lot);
        });
    }.bind(this));
}

lotSchema.methods.addAvailability = function(sched) {
    return new Promise(function(resolve, reject) {
        if (!(sched instanceof Array)) {
            if (sched == null)
                return reject('Cannot add null schedule to availability.');
            if (sched.start == null || sched.end == null)
                return reject('Cannot add availablility. Must have start and end times for each range.');
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
        this.save(function(err, lot) {
            errs = errs.length == 0 ? null : errs;
            err = err || errs;
            if (err) return reject(err);
            resolve(lot);
        });
    }.bind(this));
}

lotSchema.methods.removeAvailability = function(sched, cb) {
    return new Promise(function(resolve, reject) {
        if (!(sched instanceof Array)) {
            if (sched == null)
                return reject('Cannot remove null schedule from availability.');
            if (sched.start == null || sched.end == null)
                return reject('Cannot remove availablility. Must have start and end times for each range to remove.');
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
        this.save(function(err, lot) {
            errs = errs.length == 0 ? null : errs;
            err = err || errs;
            if (err) return reject(err);
            resolve(lot);
        });
    }.bind(this));
}

lotSchema.methods.getAddress = function() {
    if (!this.location) return null;
    return this.location.address || null;
}

lotSchema.methods.getLocation = function() {
    return Object.assign([], this.location.coordinates, {
        long: this.location.coordinates[0],
        lat: this.location.coordinates[1]
    });
}

lotSchema.methods.setLocation = function(location, address, cb) {
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
    this.location.address = address;
    this.save(cb);
}

var Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
