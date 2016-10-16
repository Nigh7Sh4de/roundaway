var Errors = require('./../errors');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');

var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAttendant.bind(app), this.GetAllLots.bind(this));
    app.put('/api/lots', app.checkAuth, app.bodyParser.json(), this.CreateLot.bind(this));
    app.get('/api/lots/:id', app.checkAuth, app.checkAttendant.bind(app), this.GetLot.bind(this));
    app.get('/api/lots/:id/location', app.checkAuth, app.checkOwner.bind(app), this.GetLocationOfLot.bind(this));
    app.get('/api/lots/:id/spots', app.checkAuth, app.checkAttendant.bind(app), this.GetSpotsForLot.bind(this));
    app.get('/api/lots/:id/attendants', app.checkAuth, app.checkOwner.bind(app), this.GetAttendantsForLot.bind(this));
    app.put('/api/lots/:id/attendants', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.AddAttendantsToLot.bind(this));
    app.get('/api/lots/:id/available', app.checkAuth, app.checkAttendant.bind(app), app.bodyParser.json(), this.GetAllAvailabilityOfLot.bind(this));
    app.put('/api/lots/:id/available/check', app.checkAuth, app.checkAttendant.bind(app), app.bodyParser.json(), this.CheckAvailabilityOfLot.bind(this));
    app.put('/api/lots/:id/available', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.AddAvailabilityToLot.bind(this));
    app.put('/api/lots/:id/available/remove', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.RemoveAvailabilityFromLot.bind(this));
    app.get('/api/lots/:id/price', app.checkAuth, app.checkAttendant.bind(app), this.GetPriceOfLot.bind(this));
    app.put('/api/lots/:id/price', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetPriceOfLot.bind(this));
    app.get('/api/lots/:id/name', app.checkAuth, app.checkAttendant.bind(app), this.GetNameOfLot.bind(this));
    app.put('/api/lots/:id/name', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetNameOfLot.bind(this));
    app.get('/api/lots/:id/description', app.checkAuth, app.checkAttendant.bind(app), this.GetDescriptionOfLot.bind(this));
    app.put('/api/lots/:id/description', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetDescriptionOfLot.bind(this));
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
                coordinates: [loc[0].longitude, loc[0].latitude],
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
    GetLocationOfLot: function(req, res) {
        res.sendGood('Found location of lot', JSON.parse(JSON.stringify(req.doc.location)));
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
    GetAllAvailabilityOfLot: function(req, res) {
        res.sendGood('Found availability for lot', {available: req.doc.available.ranges});
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
    GetPriceOfLot: function(req, res) {
        var price = req.doc.getPrice();
        if (!price) return res.sendBad(new Errors.MissingProperty(req.doc, 'price', req.doc.getPrice()));
        res.sendGood('Found price for lot', price);
    },
    SetPriceOfLot: function(req, res) {
        var app = this.app;
        app.db.spots.find({lot: req.doc.id})
        .exec()
        .then(function(spots) {
            return Promise.all([
                req.doc.setPrice(req.body)
            ].concat(spots.map(function(spot) {
                return spot.setPrice(req.body);
            })))
        })
        .then(function(lot) {
            res.sendGood('Set price for lot and all of the lot\'s spots', {
                lot: results.shift(),
                spots: results
            })
        })
        .catch(function(err) {
            res.sendBad(err)
        });
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
    },
    GetNameOfLot: function(req, res) {
        var name = req.doc.getName();
        if (!name) return res.sendBad(new Errors.MissingProperty(req.doc, 'name', req.doc.getName()));
        res.sendGood('Found name for lot', name);
    },
    SetNameOfLot: function(req, res) {
        req.doc.setName(req.body.name)
        .then(function(lot) {
            res.sendGood('Set name for lot', lot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetDescriptionOfLot: function(req, res) {
        var description = req.doc.getDescription();
        if (!description) return res.sendBad(new Errors.MissingProperty(req.doc, 'description', req.doc.getDescription()));
        res.sendGood('Found description for lot', description);
    },
    SetDescriptionOfLot: function(req, res) {
        req.doc.setDescription(req.body.description)
        .then(function(lot) {
            res.sendGood('Set description for lot', lot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    }
}

module.exports = controller;