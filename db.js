var mongoose = require('mongoose');
var Schema = mongoose.Scema;
mongoose.connect('mongodb://localhost/roundaway');

var User = require('./app/models/User')
var Parkade = require('./app/models/Parkade')

var collections = {
    users: User,
    parkades: Parkade
}

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
        //TODO: parse id
        collections[collection].find(search || {}, function (err, docs) {
            return cb(err, docs);
        });
    },
    createParkade: function(parkade, cb) {
        var p = new Parkade();
        p.address = parkade.address;
        p.location.coordinates = parkade.coordinates;
        p.save(function(err) {
            return cb(err);
        });
    },
    checkUser: function(strategy, profile, cb) {
        var searchProp = 'authid.' + strategy;
        var search = {};
        search[searchProp] = profile.id;

        User.findOne(search, function(err, doc) {
            if (err != null)
                throw err;
            if (doc)
                return cb(null, doc);
            else {
                search.name = profile.displayName;
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
                user.link(strat, profile.id, cb);
            else
                doc.remove(function(err) {
                    if (err != null)
                        return cb(err);
                    else
                        user.link(strat, profile.id, cb);
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

module.exports = _db;
