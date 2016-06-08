var mongoose = require('mongoose');
var Schema = mongoose.Scema;

var User = require('./models/User')
var Booking = require('./models/Booking');
var Spot = require('./models/Spot')
var Lot = require('./models/Lot');

var _db = {
    findById: function(collection, id, cb) {
        collections[collection].findById(id, function(err, res) {
            if (err)
                return cb(err);
            else {
                return cb(null, res);
            }
        });
    },
    find: function(collection, search, cb) {
        collections[collection].find(search || {}, function (err, docs) {
            return cb(err, docs);
        });
    },
    createSpot: function(spot, cb) {
        var p = new Spot();
        p.address = spot.address;
        p.location.coordinates = spot.coordinates;
        p.save(function(err) {
            return cb(err);
        });
    },
    checkUser: function(strategy, profile, cb) {
        var searchProp = 'authid.' + strategy;
        var search = {};
        search[searchProp] = profile.id;

        collections.prototype.users.findOne(search, function(err, doc) {
            if (err)
                throw err;
            if (doc)
                return cb(null, doc);
            else {
                search.profile = {
                    name: profile.displayName
                }
                var newUser = new User(search);
                newUser.save(function(err) {
                    if (err)
                        throw err;
                })
                return cb(null, newUser);
            }
        })
    },
    connect: function(user, strat, profile, cb) {
        var searchProp = 'authid.' + strat;
        var search = {};
        search[searchProp] = profile.id;
        User.findOne(search, function(err, doc) {
            if (doc == null)
                user.addAuth(strat, profile.id, cb);
            else
                doc.remove(function(err) {
                    if (err)
                        return cb(err);
                    else
                        user.addAuth(strat, profile.id, cb);
                });
                //TODO: proper user merges
                // user.merge(doc, function(err) {
                //     if (err == null)
                //         return cb(err);
                //     else {
                //         return user.save(cb);
                //     }
                // }
        })
    }
}

var collections = function() {}

collections.prototype = {
    
    connect: function() {
        mongoose.connect('mongodb://localhost/roundaway');
    },
    users: User,
    bookings: Booking,
    spots: Spot,
    lots: Lot,
    checkUser: _db.checkUser,
    connectUser: _db.connect
}

module.exports = collections;
// module.exports = _db;
