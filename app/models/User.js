var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    authid: {
        facebook: String,
        google: String
    },
    admin: {
        type: Boolean,
        default: false
    },
    lotIds: [],
    spotIds: [],
    bookingIds: []
});

userSchema.methods.link = function(strat, id, cb) {
    this.authid[strat] = id;
    this.save(cb);
}

userSchema.methods.addLot = function(lot, cb) {
    if (typeof lot === 'object')
        lot = lot.id;
    if (lot == null)
        return cb(new Error('Failed to add lot. Lot id cannot be null.'));
    if (typeof lot !== 'string')
        return cb(new Error('Failed to add lot. Lot id must be a valid id.'));
    this.lotIds.push(lot);
    this.save(cb);
}

userSchema.methods.addSpot = function(spot, cb) {
    if (typeof spot === 'object')
        spot = spot.id;
    if (spot == null)
        return cb(new Error('Failed to add spot. Spot id cannot be null.'));
    if (typeof spot !== 'string')
        return cb(new Error('Failed to add spot. Spot id must be a valid id.'));
    this.spotIds.push(spot);
    this.save(cb);
}

userSchema.methods.addBooking = function(booking, cb) {
    if (typeof booking === 'object')
        booking = booking.id;
    if (booking == null)
        return cb(new Error('Failed to add booking. Booking id cannot be null.'));
    if (typeof booking !== 'string')
        return cb(new Error('Failed to add booking. Booking id must be a valid id.'));
    this.bookingIds.push(booking);
    this.save(cb);
}

userSchema.methods.merge = function(anotherUser, cb) {
    var errors = [];

    userSchema.statics.forEach(function(strat) {
        if (anotherUser.authid[strat] != null) {
            if (this.authid[strat] == null)
                this.authid[strat] = anotherUser.authid[strat];
            else if (this.authid[strat] != anotherUser.authid[strat]) {
                errors.push('The accounts have two different ' + strat + ' logins associated with them. Please unlink one before connecting.')
            }
        }
    }.bind(this));
    if (this.admin || anotherUser.admin)
        this.admin = true;

    if (this.name != null && anotherUser.name != null && this.name != anotherUser.name)
        errors.push('The accounts have different profiles. Please resolve these issues before connecting.');
    else if (this.name == null)
        this.name = anotherUser.name;

    return cb(errors);

}

var User = mongoose.model('User', userSchema);

module.exports = User;
