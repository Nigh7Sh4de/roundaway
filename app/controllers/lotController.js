// var request = require('request');


var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAdmin, this.GetAllLots.bind(this));
    app.get('/api/lots/:id', app.checkAuth, app.checkAdmin, this.GetLot.bind(this));
    app.get('/api/lots/:id/location', app.checkAuth, app.checkAdmin, this.GetLocationOfLot.bind(this));
    app.put('/api/lots/:id/location', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetLocationOfLot.bind(this));
    app.get('/api/lots/:id/spots', app.checkAuth, app.checkAdmin, this.GetSpotsForLot.bind(this));
    app.put('/api/lots/:id/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddSpotsToLot.bind(this));
    app.delete('/api/lots/:id/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.RemoveSpotsFromLot.bind(this));
}

controller.prototype = {
    GetAllLots: function(req, res) {
        this.app.db.lots.find({}, function(err, docs) {
            if (err != null) {
                return res.status(500).send(err.message);
            }
            else {
                return res.send(docs);
            }
        })
    },
    GetLot: function(req, res) {
        this.app.db.lots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Lot not found.');
            else
                return res.send(doc);
        })
    },
    GetLocationOfLot: function(req, res) {
        this.app.db.lots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Lot not found.');
            else {
                var loc = {
                    address: doc.getAddress(),
                    coordinates: doc.getLocation()
                }
                return res.send(loc);
                
            }
        })
    },
    SetLocationOfLot: function(req, res) {
        var coords = req.body.coordinates;
        this.app.db.lots.findById(req.params.id, function(err, lot) {
            if (err != null) {
                return res.status(500).send(err.message);
            }
            else {
                if (coords instanceof Array)
                    coords = {lat:coords[0], lon:coords[1]};
                if (coords.lon == null)
                    coords.lon = coords.long;
                if (coords.long !== undefined)
                    delete coords.long;
                this.app.geocoder.reverse(coords, function(err, loc) {
                    loc = loc[0];
                    var c = 0,
                        total = 2;
                    var next = function(err) {
                        if (err != null)
                            return res.status(500).send(err.message);
                        if(++c >= total)
                            done();
                    }
                    var done = function() {
                        res.sendStatus(200);
                    }
                    lot.setAddress(loc.formattedAddress, next);
                    lot.setLocation(coords, next);
                })    
            }
        });
    },
    GetSpotsForLot: function(req, res) {
        this.app.db.lots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Lot not found.');
            else {
                var result = [];
                var spots = doc.getSpots();
                var next = function(obj) {
                    result.push(obj);
                    if (result.length >= spots.length)
                        return res.send(result);
                }
                spots.forEach(function(spot) {
                    this.app.db.spots.findById(spot, function(err, doc) {
                        if (err != null)
                            next('Could not find spot ' + spot + ': ' + err.message);
                        else if (doc == null)
                            next('Could not find spot ' + spot);
                        else
                            next(doc);
                    })
                }.bind(this));
            }
        })
    },
    AddSpotsToLot: function(req, res) {
        res.sendStatus(501);
    },
    RemoveSpotsFromLot: function(req, res) {
        res.sendStatus(501);
    }
}

module.exports = controller;