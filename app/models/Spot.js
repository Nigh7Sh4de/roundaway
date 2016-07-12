var ranger = require('rangerjs');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Schema = mongoose.Schema;
var Price = require('./Price');
var Location = require('./Location');
var Range = require('./Range');

var spotSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    lot: {
        type: Schema.Types.ObjectId,
        ref: 'Lot'
    },
    location: Location,
    price: {
        perHour: Price
    },
    available: Range(Date),
    booked: Range(Date),
    // bookings: [String],
    description: String
}, {
    timestamps: true,
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

spotSchema.methods.setPrice = function(price) {
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
        this.save(function(err, spot) {
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this));
}

spotSchema.methods.getAddress = function() {
    return this.location.address || null;
}

spotSchema.methods.getLocation = function() {
    if (!this.location || !this.location.coordinates)
        return null;
    return Object.assign([], this.location.coordinates, {
        long: this.location.coordinates[0],
        lat: this.location.coordinates[1]
    });
}

spotSchema.methods.setLocation = function(coords, address) {
    return new Promise(function(resolve, reject) {
        if (typeof address !== 'string' || address == '')
            return reject('Cannot set address. Provided address is invlaid.');
        if (coords instanceof Array) {
            if (coords.length != 2)
                return reject('Cannot set location because the specified coordinates are invalid.');
            var long = parseFloat(coords[0]);            
            var lat = parseFloat(coords[1]);            
            if (isNaN(long) ||
                isNaN(lat))
                return reject('Cannot set location because the specified coordinates are invalid.');
            coords = [long, lat];
        }
        else {
            if (typeof coords !== 'object' || coords == null)
                return reject('Cannot set location because the specified coordinates are invalid.');
            coords.long = parseFloat(coords.long);
            coords.lon = parseFloat(coords.lon);
            coords.lat = parseFloat(coords.lat);
            if (isNaN(coords.long))
                coords.long = coords.lon;
            if (isNaN(coords.long) ||
                isNaN(coords.lat))
                return reject('Cannot set location because the specified coordinates are invalid.');
            coords = [coords.long, coords.lat];
        }
        this.location = {
            coordinates: coords,
            address: address
        }
        this.save(function(err, spot) {
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this))
}

spotSchema.methods.getDescription = function() {
    return this.description || null;
}

spotSchema.methods.setDescription = function(description) {
    return new Promise(function(resolve, reject) {
        this.description = String(description);
        this.save(function(err, spot) {
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this))
}

spotSchema.methods.removeDescription = function() {
    return new Promise(function(resolve, reject) {
        this.description = null;
        this.save(function(err, spot) {
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this))
}

spotSchema.methods.getLot = function() {
    return this.lot || null;
}

spotSchema.methods.setLot = function(lot, cb) {
    return new Promise(function(resolve, reject) {
        if (!(lot instanceof ObjectId) && typeof lot === 'object' && lot)
            lot = lot.id || lot._id || lot;
        this.lot = lot;
        this.save(function(err, spot) {
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this))
}

spotSchema.methods.removeLot = function(cb) {
    return new Promise(function(resolve, reject) {
        this.lot = null;
        this.save(function(err, spot) {
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this))
}

spotSchema.methods.addAvailability = function(sched) {
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
        this.save(function(err, spot) {
            errs = errs.length == 0 ? null : errs;
            err = err || errs;
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this));
}

spotSchema.methods.removeAvailability = function(sched, cb) {
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
        this.save(function(err, spot) {
            errs = errs.length == 0 ? null : errs;
            err = err || errs;
            if (err) return reject(err);
            resolve(spot);
        });
    }.bind(this));
}

var Spot = mongoose.model('Spot', spotSchema);

module.exports = Spot;
