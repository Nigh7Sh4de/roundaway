// var request = require('request');
var Spot = require('./../models/Spot');

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
        this.app.db.lots.findById(req.params.id, function(err, lot) {
            var errors = [];
            if (err != null)
                return res.status(500).send(err.message);
            else if (lot == null)
                return res.status(500).send('Lot not found.');
            else {
                var spots = [];
                var failedSpots = 0;
                var total = 0;
                var done = function() {
                    lot.addSpots(spots, function(err) {
                        if (err != null)
                            return spotFailed(err.message);
                        lot.save(function(err) {
                            if (err != null)
                                return spotFailed(err.message);
                            res.status(200).send({errors: errors});
                        })
                    })
                }
                var spotFailed = function(err) {
                    errors.push(err);
                    if (++failedSpots >= total)
                        return res.status(500).send({errors: errors});
                }
                if (req.body.spots != null && req.body.spots instanceof Array) {
                    total = req.body.spots.length;
                    var i = -1;
                    req.body.spots.forEach(function(spot, j) {
                        var setSpotNumber = function() {
                            lot.claimSpotNumbers(null, function(err, num) {
                                if (err != null)
                                    return spotFailed(err.message);
                                i++;
                                req.body.spots[i].location = lot.location;
                                req.body.spots[i].number = num[0];
                                req.body.spots[i].save(function(err, savedSpot) {
                                    if (err != null)
                                        return spotFailed(err.message);
                                    spots.push(savedSpot);
                                    if (spots.length + failedSpots >= req.body.spots.length)
                                        done();
                                })
                            });
                        }
                        if (typeof req.body.spots[j] === 'string')
                            this.app.db.spots.findById(req.body.spots[j], function(err, doc) {
                                if (err != null)
                                    return spotFailed(err.message);
                                if (doc == null)
                                    return spotFailed('Spot not found.');
                                req.body.spots[j] = doc;
                                setSpotNumber();
                            })
                        else if (req.body.spots[j] instanceof Spot)
                            setSpotNumber();
                        else
                            spotFailed('Spot argument #' + j + ' is not valid.');
                    }.bind(this))
                }
                else if (req.body.count != null && typeof req.body.count == 'number') {
                    total = req.body.count;
                    for (var i=0; i < req.body.count; i++) {
                        lot.claimSpotNumbers(null, function(err, num) {
                            if (err != null)
                                return spotFailed(err.message);
                            var spot = new Spot();
                            spot.location = lot.location;
                            spot.number = num[0];
                            spot.save(function(err, savedSpot) {
                                if (err != null)
                                    return spotFailed(err.message);
                                spots.push(savedSpot);
                                if (spots.length >= req.body.count)
                                    done();
                            });
                        })
                    }
                }
                else
                    return res.status(500).send('Your request was bad.')
            }
        });
    },
    RemoveSpotsFromLot: function(req, res) {
        res.sendStatus(501);
    }
}

module.exports = controller;