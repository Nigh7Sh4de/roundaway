var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Location = require('./Location');
var Range = require('./Range');
var Price = require('./Price');

var lotSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // spots: [],
    location: Location,
    price: {
        perHour: Price
    },
    available: Range(Date),
    // availableSpots: {
    //     type: [Number]
    // }
}, {
    timestamps: true
});

// lotSchema.statics.spotNumbersRange = {
//     min: 1,
//     max: 9999
// }

// lotSchema.methods.getSpots = function() {
//     return this.spots;
// }

// lotSchema.methods.addSpots = function(spots, cb) {
//     if (!(spots instanceof Array))
//         spots = [spots];
//     var errs = [];
//     spots.forEach(function(spot) {
//         if (typeof spot === 'object' && spot != null)
//             spot = spot.id;
//         if (typeof spot != 'string')
//             return errs.push('This spot does not have a valid ID.');
//         if (this.spots.indexOf(spot) >= 0)
//             return errs.push('This spots is already in this lot.');
//         this.spots.push(spot);
//     }.bind(this))
//     this.save(function(err) {
//         if (errs.length == 0 && err == null)
//             errs = null;
//         else if (err)
//             errs.push(err);
//         cb(errs);
//     });
// }

// lotSchema.methods.removeSpots = function(spots, cb) {
//     if (!(spots instanceof Array))
//         spots = [spots];
//     var errors = [];
//     var success = [];
//     spots.forEach(function(spot) {
//         if (typeof spot !== 'object' || spot == null)
//             return errors.push('Tried to remove null spot');
//         if (this.spots.indexOf(spot.id) < 0)
//             return errors.push('Could not remove spot. Spot with id ' + spot.id + ' is not in this lot.')
//         this.spots.splice(this.spots.indexOf(spot.id), 1);
//         this.spotNumbers.splice(this.spotNumbers.indexOf(spot.number), 1);
//         success.push(spot.id);
//     }.bind(this))
//     this.save(function(err) {
//         if (err) 
//             return cb(err);
//         else if (errors.length > 0)
//             return cb(errors, success);
//         else
//             return cb(null, success);
//     });
// }

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

// lotSchema.methods.unClaimSpotNumbers = function(nums, cb) {
//     if (!(nums instanceof Array))
//         nums = [nums];
//     nums.forEach(function(num) {
//         var index = this.spotNumbers.indexOf(num);
//         if (index >= 0)
//             this.spotNumbers.splice(index, 1);
//     }.bind(this))
//     this.save(cb);
// }

// lotSchema.methods.claimSpotNumbers = function(nums, cb) {
//     var error = [];
//     var added = [];
//     if (nums == null)
//         for (var i = lotSchema.statics.spotNumbersRange.min; i < lotSchema.statics.spotNumbersRange.max; i++)
//             if (this.spotNumbers.indexOf(i) < 0) {
//                 nums = i;
//                 break;                
//             }
//     if(!(nums instanceof Array))
//         nums = [nums];
        
//     nums.forEach(function(num) {
//         if (isNaN(num))
//             return error.push('Could not claim spot number #' + num + ' as this is not a valid spot');
//         if (this.spotNumbers.indexOf(num) >= 0)
//             return error.push('Spot number #' + num + ' already claimed.');
//         if (num < lotSchema.statics.spotNumbersRange.min ||
//             num > lotSchema.statics.spotNumbersRange.max)
//             return error.push('Spot number #' + num + ' is out of range.');
//         added.push(num);
//         this.spotNumbers.push(num);
//     }.bind(this))       
    
//     this.save(function(err) {
//         if (err)
//             error.push(err);
//         cb(error.length == 0 ? null : error, added)
//     });
// }

var Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
