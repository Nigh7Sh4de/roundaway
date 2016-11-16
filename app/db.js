var mongoose = require('mongoose');
var Schema = mongoose.Scema;
var Errors = require('./errors');
/**
 * Stupid hack because mongoose doesn't know 
 * how to properly deprecate functionality that 
 * if gone should just default to native on it's own 
 */
mongoose.Promise = Promise;


var User = require('./models/User')
var Booking = require('./models/Booking');
var Spot = require('./models/Spot')
var Lot = require('./models/Lot');
var Car = require('./models/Car');

var _db = {
    // connect: function(user, strat, profile, cb) {
    //     var searchProp = 'authid.' + strat;
    //     var search = {};
    //     search[searchProp] = profile.id;
    //     User.findOne(search, function(err, doc) {
    //         if (doc == null)
    //             user.addAuth(strat, profile.id, cb);
    //         else
    //             doc.remove(function(err) {
    //                 if (err)
    //                     return cb(err);
    //                 else
    //                     user.addAuth(strat, profile.id, cb);
    //             });
                //TODO: proper user merges
                // user.merge(doc, function(err) {
                //     if (err == null)
                //         return cb(err);
                //     else {
                //         return user.save(cb);
                //     }
                // }
    //     })
    // }
}

var collections = function() {}

collections.prototype = {
    connect: function(connString) {
        if (!connString)
            throw new Errors.InvalidConfig('DB_CONNECTION_STRING');
        this.connection = mongoose.connect(connString, {
            promiseLibrary: Promise
        }).connection;
    },
    users: User,
    bookings: Booking,
    spots: Spot,
    lots: Lot,
    cars: Car,
    // connectUser: _db.connect
}

module.exports = collections;
// module.exports = _db;
