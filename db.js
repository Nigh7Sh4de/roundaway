var mongojs = require('mongojs');
var db = mongojs('roundaway', ['users']);

var _db = {
    find: function(collection, search, cb) {
        //TODO: parse id
        db[collection].find(function (err, docs) {
            cb(err, docs);
        });
    }
}

module.exports = _db;
