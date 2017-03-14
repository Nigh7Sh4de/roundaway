var Errors = require('./../errors');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');

var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAttendant.bind(app), this.GetAllLots.bind(this));
    app.post('/api/lots', app.checkAuth, app.bodyParser.json(), this.CreateLot.bind(this));
    app.get('/api/lots/:id', app.checkAuth, app.checkAttendant.bind(app), this.GetLot.bind(this));
    app.patch('/api/lots/:id', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.UpdateLot.bind(this));
    app.get('/api/lots/:id/spots', app.checkAuth, app.checkAttendant.bind(app), this.GetSpotsForLot.bind(this));
    app.get('/api/lots/:id/attendants', app.checkAuth, app.checkOwner.bind(app), this.GetAttendantsForLot.bind(this));
    app.post('/api/lots/:id/attendants', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.AddAttendantsToLot.bind(this));
    app.put('/api/lots/:id/available/check', app.checkAuth, app.checkAttendant.bind(app), app.bodyParser.json(), this.CheckAvailabilityOfLot.bind(this));
    app.post('/api/lots/:id/available', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.AddAvailabilityToLot.bind(this));
    app.post('/api/lots/:id/available/remove', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.RemoveAvailabilityFromLot.bind(this));
}

controller.prototype = {
    GetAllLots: function(req, res) {
        res.sendGood('Found lots', req.docs.map(function(doc) { 
            return doc.toJSON({getters: true}) 
        }));
    },
    GetLot: function(req, res) {
        res.sendGood('Found lot', req.doc);
    },
    UpdateLot: function(req, res) {
        var updates = [];
        if (req.body.price) updates.push(req.doc.setPrice(req.body.price));
        if (req.body.name) updates.push(req.doc.setName(req.body.name));
        if (req.body.description) updates.push(req.doc.setDescription(req.body.description));

        Promise.all(updates)
        .then(function() {
            res.sendGood('Updated lot', arguments[updates.length-1][0].toJSON({getters: true}))
        })
        .catch(function(err) {
            res.sendBad(err)
        })
    },
    CreateLot: function(req, res) {
        var app = this.app;
        var newLot = new Lot(req.body.lot || req.body).toJSON();
        delete newLot._id;
        if (newLot.location && newLot.location.address)
            var address = newLot.location.address;
        else
            return res.sendBad(new Errors.BadInput('location.address', 'create lot'));
        
        if (req.user && !newLot.user)
            newLot.user = req.user.id;
        app.geocoder.geocode(address).then(function(loc) {
            return Promise.resolve({
                coordinates: [loc[0].latitude, loc[0].longitude],
                address: loc[0].formattedAddress
            })
        })
        .then(function(location) {
            if (!location)
                throw new Errors.BadInput('location', 'create lot');
            newLot.location = location;
            if (req.body.count != null) {
                if (typeof req.body.count !== 'number' || req.body.count <= 0)
                    throw new Errors.BadInput('count', 'create lot');
                var arr = [];
                for (var i=0;i<req.body.count;i++)
                    arr.push(newLot);
                return app.db.lots.collection.insert(arr);
            }
            else {
                return app.db.lots.create(newLot);
            }
        })
        .then(function(results) {
            results = results.ops || results;
            if (results.toJSON)
                results = results.toJSON({getters: true});
            res.sendGood('Created new lots', results);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetSpotsForLot: function(req, res) {
        var app = this.app;
        app.db.spots.find({lot: req.doc.id})
        .exec()
        .then(function(spots) {
            if (!spots) throw new Errors.MissingProperty(req.doc, 'spots', false);
            res.sendGood('Found spots', spots);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    CheckAvailabilityOfLot: function(req, res) {
        if (!req.body || !req.body.start || !req.body.end)
            return res.sendBad(new Errors.BadInput(['start', 'end']));
        var start = new Date(req.body.start);
        var end = new Date(req.body.end); 
        var _start = new Date(start.valueOf() + (req.body.deviation || 0))
        var _end = new Date(end.valueOf() - (req.body.deviation || 0))
        if (_end < start) _end = start;

        app.db.spots.find({
            lot: req.doc.id,
            available: { $elemMatch: {
                start: { $lte: _start },
                end: { $gte: _end }
            }}
        })
        .exec()
        .then(function(spots) {
            if (!spots || !spots.length)
                return new Errors.NotFound('spots', {available: {_start, _end}});
            var similar = [];
            var exact = [];
            spots.forEach(spot => {
                if (spot.available.checkRange(start, end))
                    exact.push(spot);
                else similar.push(spot);
            })
            res.sendGood('Found spots with the availability', {similar, exact});
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    AddAvailabilityToLot: function(req, res) {
        if (!req.body ||
            !req.body.start ||
            !req.body.end)
            return res.sendBad(new Errors.BadInput(['start', 'end'], 'add availability'));
        req.body.start = new Date(req.body.start);
        req.body.end = new Date(req.body.end);
        if (isNaN(req.body.start.valueOf()) || isNaN(req.body.end.valueOf()))
            return res.sendBad(new Errors.BadInput('dates', 'add availability'));

        this.app.db.spots.find({lot: req.params.id})
        .then(function(spots) {
            return Promise.all([
                req.doc.addAvailability(req.body)
            ].concat(!spots.length ? [] :
                spots.map(function(spot) {
                    return spot.addAvailability(req.body);
                })
            ))
        })
        .then(function(results) {
            res.sendGood('Added availability to lot and all of the lot\'s spots', {
                lot: results.shift(),
                spots: results
            })
        })
        .catch(function(err) {
            res.sendBad(err)
        })
    },
    RemoveAvailabilityFromLot: function(req, res) {
        if (!req.body ||
            !req.body.start ||
            !req.body.end)
            return res.sendBad(new Errors.BadInput(['start', 'end'], 'remove availability'));
        req.body.start = new Date(req.body.start);
        req.body.end = new Date(req.body.end);
        if (isNaN(req.body.start.valueOf()) || isNaN(req.body.end.valueOf()))
            return res.sendBad(new Errors.BadInput('dates', 'remove availability'));   

        this.app.db.spots.find({lot: req.params.id})
        .then(function(spots) {
            return Promise.all([
                req.doc.removeAvailability(req.body)
            ].concat(spots.map(function(spot) {
                return spot.removeAvailability(req.body);
            })))
        })
        .then(function(results) {
            res.sendGood('removed availability from lot and all of the lot\'s spots', {
                lot: results.shift(),
                spots: results
            })
        })
        .catch(function(err) {
            res.sendBad(err)
        })
    },
    GetAttendantsForLot: function(req, res) {
        this.app.db.users.find({id: {$in: req.doc.attendants}})
        .then(function(attendants) {
            if (!attendants) throw new Errors.MissingProperty(req.doc, 'attendants', false);
            res.sendGood('Found attendants', attendants);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    AddAttendantsToLot: function(req, res) {
        if (!req.body.attendants)
            return res.sendBad(new Errors.BadInput('attendants'));
        var ids = (req.body.attendants instanceof Array ? req.body.attendants : [req.body.attendants])
            .map(function(att) {
                return att.id || att._id || att;
            })
        Promise.all([
            this.app.db.users.find({_id: {$in: ids}}),
            req.body.updateSpots ? this.app.db.spots.find({lot: req.doc.id}) : []
        ])
        .then(function(results) {
            var attendants = results[0];
            var spots = results[1];
            return Promise.resolve([req.doc.addAttendants(attendants)].concat(
                spots.map(function(spot) {
                    return spot.addAttendants(attendants);
                })
            ));
        })
        .then(function(results) {
            var result = {
                lot: results.shift()
            }
            if (results.length)
                result.spots = results;
            res.sendGood('Added attendants', result);
        })
        .catch(function(err) {
            return res.sendBad(err);
        })
    }
}

module.exports = controller;