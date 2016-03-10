var mongoose = require('mongoose');
var Schema = mongoose.Scema;
mongoose.connect('mongodb://localhost/roundaway');

var User = require('./app/models/User')

var collections = {
    users: User
}

var _db = {
    findById: function(collection, id, cb) {
        collections[collection].findById(id, function(err, res) {
            if (err)
                cb(err);
            else {
                cb(null, res);
            }
        });
    },
    find: function(collection, search, cb) {
        //TODO: parse id
        collections[collection].find(search || {}, function (err, docs) {
            cb(err, docs);
        });
    },
    checkUser: function(profile, cb) {
        User.findOne({ facebookid: profile.id }, function(err, doc) {
            if (err != null)
                throw err;
            if (doc)
                cb(null, doc);
            else {
                var newUser = new User({
                    name: profile.displayName,
                    facebookid: profile.id
                });
                newUser.save(function(err) {
                    if (err)
                        throw err;
                })
                cb(null, newUser);
            }
        })
    }
}

module.exports = _db;
