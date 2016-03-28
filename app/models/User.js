var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    profile: {
        name: String
    },
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
    bookingIds: [],
}, {
    timestamps: true
});

userSchema.methods.addLot = function(lots, cb) {
    if (!(lots instanceof Array))
        lots = [ lots ];
    var self = this;
    lots.forEach(function(lot) {
        if (typeof lot === 'object')
            lot = lot.id;
        if (lot == null)
            return cb(new Error('Failed to add lot. Lot id cannot be null.'));
        if (typeof lot !== 'string')
            return cb(new Error('Failed to add lot. Lot id must be a valid id.'));
        
        self.lotIds.push(lot);
        self.save(cb);
    })
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

userSchema.methods.setName = function(name, cb) {
    if (name == null || name == '')
        return(cb(new Error('Failed to set name for this user. Name cannot be empty.')));
    if (typeof name !== 'string')
        return(cb(new Error('Failed to set name for this user. Name must be a string.')));
    this.profile.name = name;    
    this.save(cb);
}

userSchema.methods.addAuth = function(strategy, obj, cb) {
    if (typeof obj === 'function') {
        cb = obj;
        obj = {};
    }
    if (typeof strategy !== 'string')
        return cb(new Error('Failed to add auth. "' + strategy + '" is not a valid auth.')); 
    
    if (this.authid[strategy] != null)
        return cb(new Error('Failed to add auth for ' + strategy + '. This auth already exists.'));
    this.authid[strategy] = obj;
    this.save(cb);
}

userSchema.methods.removeAuth = function(strategy, cb) {
    if (typeof strategy !== 'string' || strategy == '')
        return (cb(new Error('Failed to remove auth. "' + strategy + '" is not a valid auth.')));
    if (this.authid[strategy] == null)
        return (cb(new Error('Failed to remove auth. "' + strategy + '" does not exist.')));
    delete this.authid[strategy];
    this.save(cb);
}

userSchema.methods.getAuth = function(strategy) {
    if (typeof strategy !== 'string' || strategy == '')
        return new Error('Could not find auth. "' + strategy + '" is not a valid auth key.');
    if (this.authid[strategy] == null)
        return null;
    else
        return this.authid[strategy];
}

userSchema.methods.hasLot = function(lot) {
    if (typeof lot === 'object' && lot != null)
        lot = lot.id;
    if (typeof lot !== 'string' || lot == '')
        return new Error('Failed to check if user has lot.');
    return this.lotIds.indexOf(lot) >= 0;
}

userSchema.methods.hasSpot = function(spot) {
    if (typeof spot === 'object' && spot != null)
        spot = spot.id;
    if (typeof spot !== 'string' || spot == '')
        return new Error('Failed to check if user has spot.');
    return this.spotIds.indexOf(spot) >= 0;
}

userSchema.methods.hasBooking = function(booking) {
    if (typeof booking === 'object' && booking != null)
        booking = booking.id;
    if (typeof booking !== 'string' || booking == '')
        return new Error('Failed to check if user has booking.');
    return this.bookingIds.indexOf(booking) >= 0;
}

// userSchema.methods.merge = function(anotherUser, cb) {
//     var errors = [];

//     userSchema.statics.forEach(function(strat) {
//         if (anotherUser.authid[strat] != null) {
//             if (this.authid[strat] == null)
//                 this.authid[strat] = anotherUser.authid[strat];
//             else if (this.authid[strat] != anotherUser.authid[strat]) {
//                 errors.push('The accounts have two different ' + strat + ' logins associated with them. Please unlink one before connecting.')
//             }
//         }
//     }.bind(this));
//     if (this.admin || anotherUser.admin)
//         this.admin = true;

//     if (this.name != null && anotherUser.name != null && this.name != anotherUser.name)
//         errors.push('The accounts have different profiles. Please resolve these issues before connecting.');
//     else if (this.name == null)
//         this.name = anotherUser.name;

//     return cb(errors);

// }

var User = mongoose.model('User', userSchema);

module.exports = User;
