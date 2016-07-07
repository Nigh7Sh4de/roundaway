var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lotSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // spots: [],
    address: String,
    location: {
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    }
    // availableSpots: {
    //     type: [Number]
    // }
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

lotSchema.methods.getAddress = function() {
    return this.address;
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
    this.address = address;
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
