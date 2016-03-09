var mongoose = require('mongoose');
var Schema = mongoose.Scema;
mongoose.connect('mongodb://localhost/roundaway');

var User = require('./app/models/User')

var collections = {
    users: User
}

var _db = {
    find: function(collection, search, cb) {
        //TODO: parse id
        collections[collection].find(search || {}, function (err, docs) {
            cb(err, docs);
        });
    }
}

module.exports = _db;
