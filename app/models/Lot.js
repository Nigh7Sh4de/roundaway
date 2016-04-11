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
    }
});

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
        location.lat = parseInt(location.lat);
        if (isNaN(location.long) ||
            isNaN(location.lat))
            return cb(new Error('Cannot set location. Specified coordinates are invalid.'));
        this.location.coordinates = [location.long, location.lat];
    }
    this.save(cb);
}

var Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
