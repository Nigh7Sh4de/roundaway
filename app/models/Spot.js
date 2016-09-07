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
    attendants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    lot: {
        type: Schema.Types.ObjectId,
        ref: 'Lot'
    },
    name: String,
    reserved: Boolean,
    location: Location,
    price: {
        perHour: Price
    },
    available: Range(Date),
    booked: Range(Date),
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

spotSchema.methods.addAttendants = function(attendants) {
    return new Promise(function(resolve, reject) {
        attendants = attendants instanceof Array ? attendants : [attendants];
        this.attendants = [...new Set(this.attendants.concat(attendants).map(function(att) {
            if (typeof att === 'string')
                return att;
            if (att instanceof ObjectId)
                return att.toString();
            return att.id || att._id.toString() || att;
        }))];
        this.save(function(err, spot) {
            if (err)
                return reject(err);
            return resolve(spot);
        })
    }.bind(this));
}

spotSchema.methods.setReserved = function(reserved) {
    return new Promise(function(resolve, reject) {
        this.reserved = reserved;
        this.save(function(err, spot) {
            if (err)
                return reject(err);
            return resolve(spot);
        });
    }.bind(this));
}

spotSchema.methods.getReserved = function() {
    return this.reserved || false;
}

spotSchema.methods.setName = function(name) {
    return new Promise(function(resolve, reject) {
        this.name = name;
        this.save(function(err, spot) {
            if (err)
                return reject(err);
            return resolve(spot);
        });
    }.bind(this));
}

spotSchema.methods.getName = function() {
    return this.name || null;
}

spotSchema.methods.addBookings = function(bookings) {
    return new Promise(function(resolve, reject) {
        bookings = bookings instanceof Array ? bookings : [bookings];
        bookings.forEach(function(booking) {
            if (!booking)
                return reject('Cannot add empty object as booking.');
            if (booking.getStart() ==  null || 
                booking.getEnd() == null)
                return reject('Booking ' + booking.id + ' must have a start and end time set.');
            if (!this.available.checkRange(booking.start, booking.end))
                return reject('Cannot add booking ' + booking.id + ' The specified time range is not available for this spot: ' + booking.start + ' ~ ' + booking.end);
            this.booked.addRange(booking.start, booking.end);
            this.available.removeRange(booking.start, booking.end);
            this.markModified('booked');
            this.markModified('available');
        }.bind(this))
        this.save(function(err, spot) {
            if (err) return reject(err);
            resolve(spot);
        })
    }.bind(this));
}


spotSchema.methods.removeBookings = function(bookings, cb) {
    return new Promise(function(resolve, reject) {
        if (!(bookings instanceof Array))
            bookings = [bookings];
        for (var i=0; i<bookings.length; i++) {
            var booking = bookings[i];
            if (!booking)
                return reject('Cannot remove null booking');
            if (!booking.spot || (booking.spot != this && booking.spot != this.id)) 
                return reject('Cannot remove booking that is not associated with this spot');
            if (!booking.start || !booking.end)
                return reject('Cannot remove a booking with no set time');
            this.booked.removeRange(booking.start, booking.end);
            this.available.addRange(booking.start, booking.end);
        }
        this.save(function (err, spot) {
            if (err) return reject(err);
            else return resolve(spot);
        });
    }.bind(this))
}

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
        this.lot = lot;
        if (lot.location) this.location = lot.location;
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
