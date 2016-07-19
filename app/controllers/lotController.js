var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');

var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAdmin, this.GetAllLots.bind(this));
    app.put('/api/lots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateLot.bind(this));
    app.get('/api/lots/:id', app.checkAuth, app.checkAdmin, this.GetLot.bind(this));
    app.get('/api/lots/:id/location', app.checkAuth, app.checkAdmin, this.GetLocationOfLot.bind(this));
    app.get('/api/lots/:id/spots', app.checkAuth, app.checkAdmin, this.GetSpotsForLot.bind(this));
    app.put('/api/lots/:id/available', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddAvailabilityToLot.bind(this));
    app.put('/api/lots/:id/available/remove', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.RemoveAvailabilityFromLot.bind(this));
    app.get('/api/lots/:id/price', app.checkAuth, app.checkAdmin, this.GetPriceOfLot.bind(this));
    app.put('/api/lots/:id/price', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetPriceOfLot.bind(this));
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
        this.app.db.lots.findById(req.params.id)
        .exec()
        .then(function(lot) {
            return res.sendGood('Lot found', lot);
        })
        .catch(function(err) {
            return res.sendBad(err);
        })
    },
    CreateLot: function(req, res) {
        var app = this.app;
        var newLot = new Lot(req.body.lot || req.body).toJSON();
        delete newLot._id;
        if (newLot.location && newLot.location.coordinates)
            var coords = {
                lon: newLot.location.coordinates[0] || newLot.location.coordinates.long || newLot.location.coordinates.lon,
                lat: newLot.location.coordinates[1] || newLot.location.coordinates.lat
            }
        else
            return res.sendBad('Could not create lot because no coordinates were specified');
        
        if (req.user && !newLot.user)
            newLot.user = req.user.id;
        app.geocoder.reverse(coords).then(function(loc) {
            return Promise.resolve({
                coordinates: [loc[0].longitude, loc[0].latitude],
                address: loc[0].formattedAddress
            })
        })
        .then(function(location) {
            if (!location)
                throw 'Cannot create a lot without a location';
            newLot.location = location;
            if (req.body.count != null) {
                if (typeof req.body.count !== 'number' || req.body.count <= 0)
                    return res.sendBad('Could not create lot as the specified count was invalid');
                var arr = [];
                for (var i=0;i<req.body.count;i++)
                    arr.push(newLot);
                return this.app.db.lots.collection.insert(arr);
            }
            else {
                return this.app.db.lots.create(newLot);
            }
        })
        .then(function(results) {
            res.sendGood('Created new lots', results.ops || results);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetLocationOfLot: function(req, res) {
        this.app.db.lots.findById(req.params.id)
        .exec()
        .then(function(lot) {
            if (!lot) throw 'Lot not found';
            return res.sendGood('Found location of lot', JSON.parse(JSON.stringify(lot.location)));
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetSpotsForLot: function(req, res) {
        var app = this.app;
        app.db.spots.find({lot: req.params.id})
        .exec()
        .then(function(spots) {
            if (!spots) throw 'This lot has no spots';
            res.sendGood('Found spots', spots);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    AddAvailabilityToLot: function(req, res) {
        if (!req.body ||
            !req.body.start ||
            !req.body.end)
            return res.sendBad('Could not add availability because start and end times were not specified for the availability');
        req.body.start = new Date(req.body.start);
        req.body.end = new Date(req.body.end);
        if (isNaN(req.body.start.valueOf()) || isNaN(req.body.end.valueOf()))
            return res.sendBad('Could not add availability because invalid dates were provided');
        Promise.all([
            this.app.db.lots.findById(req.params.id),
            this.app.db.spots.find({lot: req.params.id})
        ])
        .then(function(results) {
            return Promise.all([
                results[0].addAvailability(req.body)
            ].concat(results[1].map(function(spot) {
                return spot.addAvailability(req.body);
            })))
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
            return res.sendBad('Could not remove availability because start and end times were not specified for the availability');
        req.body.start = new Date(req.body.start);
        req.body.end = new Date(req.body.end);
        if (isNaN(req.body.start.valueOf()) || isNaN(req.body.end.valueOf()))
            return res.sendBad('Could not remove availability because invalid dates were provided');
        Promise.all([
            this.app.db.lots.findById(req.params.id),
            this.app.db.spots.find({lot: req.params.id})
        ])
        .then(function(results) {
            return Promise.all([
                results[0].removeAvailability(req.body)
            ].concat(results[1].map(function(spot) {
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
        var app = this.app;
        app.db.lots.findById(req.params.id)
        .exec()
        .then(function(lot) {
            if (!lot) throw 'lot not found';
            var price = lot.getPrice();
            if (!price) throw 'Price is not set for this lot';;
            res.sendGood('Found price for lot', price);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    SetPriceOfLot: function(req, res) {
        var app = this.app;
        app.db.lots.findById(req.params.id)
        .exec()
        .then(function(lot) {
            if (!lot) throw 'lot not found';
            return lot.setPrice(req.body);
        })
        .then(function(lot) {
            res.sendGood('Set price for lot', spot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    }
}

module.exports = controller;