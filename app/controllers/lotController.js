var Errors = require('./../errors');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');

var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAdmin, this.GetAllLots.bind(this));
    app.put('/api/lots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateLot.bind(this));
    app.get('/api/lots/:id', app.checkAuth, app.checkOwner, this.GetLot.bind(this));
    app.get('/api/lots/:id/location', app.checkAuth, app.checkOwner, this.GetLocationOfLot.bind(this));
    app.get('/api/lots/:id/spots', app.checkAuth, app.checkOwner, this.GetSpotsForLot.bind(this));
    app.get('/api/lots/:id/available', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.GetAllAvailabilityOfLot.bind(this));
    app.put('/api/lots/:id/available', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.AddAvailabilityToLot.bind(this));
    app.put('/api/lots/:id/available/remove', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.RemoveAvailabilityFromLot.bind(this));
    app.get('/api/lots/:id/price', app.checkAuth, app.checkOwner, this.GetPriceOfLot.bind(this));
    app.put('/api/lots/:id/price', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.SetPriceOfLot.bind(this));
}

controller.prototype = {
    GetAllLots: function(req, res) {
        this.app.db.lots.find({})
        .exec()
        .then(function(lots) {
            return res.sendGood('Lots found', lots);
        })
        .catch(function(err) {
            return res.sendBad(err);
        })
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
    }
}

module.exports = controller;