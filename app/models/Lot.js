var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lotSchema = new Schema({
    spots: []
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

var Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
