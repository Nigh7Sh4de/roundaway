var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lotSchema = new Schema({
    spots: [],
    address: String,
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    spotNumbers: {
        type: [Number]
    }
});

lotSchema.statics.spotNumbersRange = {
    min: 1,
    max: 9999
}

lotSchema.methods.getSpots = function() {
    return this.spots;
}

lotSchema.methods.addSpots = function(spots, cb) {
    if (!(spots instanceof Array))
        spots = [spots];
    var errs = [];
    spots.forEach(function(spot) {
        if (typeof spot === 'object' && spot != null)
            spot = spot.id;
        if (typeof spot != 'string')
            return errs.push(new Error('This spot does not have a valid ID.')); 
        this.spots.push(spot);
    }.bind(this))
    this.save(function(err) {
        if (errs.length == 0 && err == null)
            errs = null;
        else if (err != null)
            errs.push(err);
        cb(errs);
    });
}

lotSchema.methods.removeSpots = function(spots, cb) {
    if (!(spots instanceof Array))
        spots = [spots];
    var errors = [];
    var success = [];
    spots.forEach(function(spot) {
        if (typeof spot !== 'object' || spot == null)
            return errors.push(new Error('Tried to remove null spot'));
        this.spots.splice(this.spots.indexOf(spot.id), 1);
        this.spotNumbers.splice(this.spotNumbers.indexOf(spot.number), 1);
        success.push(spot.id);
    }.bind(this))
    this.save(function(err) {
        if (err != null) 
            return cb(err);
        else if (errors.length > 0)
            return cb(errors, success);
        else
            return cb(null, success);
    });
}

lotSchema.methods.getAddress = function() {
    return this.address;
}

lotSchema.methods.setAddress = function(address, cb) {
    if (typeof address !== 'string' || address == '')
        return cb(new Error('Cannot set address. Provided address is invlaid.'));
    this.address = address;
    this.save(cb);
}

lotSchema.methods.getLocation = function() {
    return Object.assign([], this.location.coordinates, {
        long: this.location.coordinates[0],
        lat: this.location.coordinates[1]
    });
}

lotSchema.methods.setLocation = function(location, cb) {
    if (location instanceof Array) {
        if (location.length != 2)
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        var long = parseInt(location[0]);            
        var lat = parseInt(location[1]);            
        if (isNaN(long) ||
            isNaN(lat))
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        this.location.coordinates = [long, lat];
    }
    else {
        if (typeof location !== 'object' || location == null)
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        location.long = parseInt(location.long);
        location.lon = parseInt(location.lon);
        location.lat = parseInt(location.lat);
        if (isNaN(location.long))
            location.long = location.lon;
        if (isNaN(location.long) ||
            isNaN(location.lat))
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        this.location.coordinates = [location.long, location.lat];
    }
    this.save(cb);
}

lotSchema.methods.claimSpotNumbers = function(nums, cb) {
    var error = [];
    var added = [];
    if (nums == null)
        for (var i = lotSchema.statics.spotNumbersRange.min; i < lotSchema.statics.spotNumbersRange.max; i++)
            if (this.spotNumbers.indexOf(i) < 0) {
                nums = i;
                break;                
            }
    if(!(nums instanceof Array))
        nums = [nums];
        
    nums.forEach(function(num) {
        if (isNaN(num))
            return error.push(new Error('Could not claim spot number #' + num + ' as this is not a valid spot'));
        if (this.spotNumbers.indexOf(num) >= 0)
            return error.push(new Error('Spot number #' + num + ' already claimed.'));
        if (num < lotSchema.statics.spotNumbersRange.min ||
            num > lotSchema.statics.spotNumbersRange.max)
            return error.push(new Error('Spot number #' + num + ' is out of range.'));
        added.push(num);
        this.spotNumbers.push(num);
    }.bind(this))       
    
    this.save(function(err) {
        if (err != null)
            error.push(err);
        cb(error.length == 0 ? null : error, added)
    });
}

var Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
