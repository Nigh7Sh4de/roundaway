// var request = require('request');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');

var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAdmin, this.GetAllLots.bind(this));
    app.put('/api/lots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateLot.bind(this));
    app.get('/api/lots/:id', app.checkAuth, app.checkAdmin, this.GetLot.bind(this));
    app.get('/api/lots/:id/location', app.checkAuth, app.checkAdmin, this.GetLocationOfLot.bind(this));
    app.put('/api/lots/:id/location', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetLocationOfLot.bind(this));
    app.get('/api/lots/:id/spots', app.checkAuth, app.checkAdmin, this.GetSpotsForLot.bind(this));
    app.put('/api/lots/:id/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddSpotsToLot.bind(this));
    app.put('/api/lots/:id/spots/remove', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.RemoveSpotsFromLot.bind(this));
}

controller.prototype = {
    GetAllLots: function(req, res) {
        this.app.db.lots.find({}, function(err, docs) {
            if (err)
                return res.sendBad(err);
            else
                return res.sendGood('Lots found', {lots: docs});
        })
    },
    GetLot: function(req, res) {
        this.app.db.lots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Lot not found');
            else
                return res.sendGood('Lot found', {lot: doc});
        })
    },
    CreateLot: function(req, res) {
        var newLot = new Lot(req.body.lot).toJSON();
        delete newLot._id;
        if (req.body.count) {
            if (typeof req.body.count !== 'number' || req.body.count <= 0)
                return res.sendBad('Could not create lot becasue the specified count was invalid');
            var arr = [];
            for (var i=0;i<req.body.count;i++)
                arr.push(newLot);
            this.app.db.lots.collection.insert(arr, function(err, result) {
                if (err)
                    return res.sendBad(err);
                res.sendGood('Lots created', result);
            })
        }
        else {
            this.app.db.lots.create(newLot, function(err, result) {
                if (err)
                    return res.sendBad(err);
                res.sendGood('Lot created', result);
            })    
        }
        
    },
    GetLocationOfLot: function(req, res) {
        var app = this.app;
        app.db.lots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Lot not found');
            else {
                var loc = {
                    address: doc.getAddress(),
                    coordinates: doc.getLocation()
                }
                return res.sendGood('Found location of lot', {location: loc});
                
            }
        })
    },
    SetLocationOfLot: function(req, res) {
        var coords = req.body.coordinates;
        var app = this.app;
        app.db.lots.findById(req.params.id, function(err, lot) {
            if (err) {
                return res.sendBad(err);
            }
            else {
                if (coords instanceof Array)
                    coords = {lon:coords[0], lat:coords[1]};
                if (coords.lon == null)
                    coords.lon = coords.long;
                if (coords.long !== undefined)
                    delete coords.long;
                app.geocoder.reverse(coords, function(err, loc) {
                    if (err)
                        return res.sendBad(err);
                    loc = loc[0];
                    var c = 0,
                        total = 2;
                    var next = function(err) {
                        if (err)
                            return res.sendBad(err);
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
        var app = this.app;
        app.db.lots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Lot not found');
            else {
                var result = [];
                var spots = doc.getSpots();
                var next = function(obj) {
                    result.push(obj);
                    if (result.length >= spots.length)
                        return res.sendGood('Found spots for lot', result);
                }
                if (spots.length > 0)
                    spots.forEach(function(spot) {
                        app.db.spots.findById(spot, function(err, doc) {
                            if (err)
                                next('Could not find spot ' + spot + ': ' + err);
                            else if (!doc)
                                next('Could not find spot ' + spot);
                            else
                                next(doc);
                        })
                    });
                else
                    return res.sendGood('This lot has no spots', {spots: spots});
            }
        })
    },
    AddSpotsToLot: function(req, res) {
        var app = this.app;
        app.db.lots.findById(req.params.id, function(err, lot) {
            var errors = [];
            if (err)
                return res.sendBad(err);
            else if (lot == null)
                return res.sendBad('Lot not found');
            else {
                var spots = [];
                var claimedNums = [];
                var failedSpots = 0;
                var total = 0;
                var cleanup = function(cb) {
                    spots.forEach(function(spot, i) {
                        var next = function(err) {
                            if (err)
                                errors.push(err);
                            if (i+1>=spots.length)
                                cb();
                        }
                        if (lot.spots.indexOf(spot.id) >= 0)
                            return next();
                        lot.unClaimSpotNumbers(spot.number, function(err) {
                            if (err)
                                return errors.push(err);
                            spot.number = null;
                            spot.save(next)    
                        })
                        
                    })
                }
                var done = function() {
                    lot.addSpots(spots, function(err) {
                        if (err) {
                            return cleanup(function() {
                                if (err instanceof Array)
                                    errors = errors.concat(err);
                                else
                                    errors.push(err);
                                return res.sendBad(errors);
                            })
                        }
                        else res.sendGood('Added spots to lot', {}, {errors: errors});
                    })
                }
                var spotFailed = function(err) {
                    errors.push(err);
                    if (++failedSpots >= total)
                        return res.sendBad(errors);
                }
                if (req.body.spots && req.body.spots instanceof Array) {
                    total = req.body.spots.length;
                    var i = -1;
                    req.body.spots.forEach(function(spot, j) {
                        var setSpotNumber = function(spot) {
                            if (lot.spots.indexOf(spot.id) >= 0)
                                return spotFailed('Cannot add spot ' + spot.id + ' as this spot is already in the lot');
                            lot.claimSpotNumbers(null, function(err, num) {
                                if (err)
                                    return spotFailed(err);
                                claimedNums.push(num[0]);
                                i++;
                                spot.location = lot.location;
                                spot.address = lot.address;
                                spot.number = num[0];
                                spot.save(function(err, savedSpot) {
                                    if (err)
                                        return spotFailed(err);
                                    spots.push(savedSpot);
                                    if (spots.length + failedSpots >= req.body.spots.length)
                                        done();
                                })
                            });
                        }
                        if (typeof req.body.spots[j] === 'string')
                            app.db.spots.findById(req.body.spots[j], function(err, doc) {
                                if (err)
                                    return spotFailed(err);
                                if (!doc)
                                    return spotFailed('Spot not found');
                                setSpotNumber(doc);
                            })
                        else if (req.body.spots[j] instanceof Spot)
                            setSpotNumber(req.body.spots[j]);
                        else
                            spotFailed('Spot argument #' + j + ' is not valid');
                    })
                }
                else if (req.body.count && typeof req.body.count == 'number') {
                    total = req.body.count;
                    for (var i=0; i < req.body.count; i++) {
                        lot.claimSpotNumbers(null, function(err, num) {
                            if (err)
                                return spotFailed(err);
                            claimedNums.push(num[0]);
                            var spot = new Spot();
                            spot.location = lot.location;
                            spot.address = lot.address;
                            spot.number = num[0];
                            spot.save(function(err, savedSpot) {
                                if (err)
                                    return spotFailed(err);
                                spots.push(savedSpot);
                                if (spots.length >= req.body.count)
                                    done();
                            });
                        })
                    }
                }
                else
                    return res.sendBad('Your request was bad')
            }
        });
    },
    RemoveSpotsFromLot: function(req, res) {
        var app = this.app;
        app.db.lots.findById(req.params.id, function(err, lot) {
            if (err)
                return res.sendBad(err);
            if (lot == null)
                return res.sendBad('Lot not found');
            var spots = [];
            var errors = [];
            var failedSpots = 0;
            var successSpots = [];
            var total = 0;
            var spotFailed = function(err) {
                errors.push(err);
                if (++failedSpots >= total)
                    return res.sendBad(errors);
                done();
            }
            var done = function(spot) {
                if (spot)
                    successSpots.push(spot);
                if (failedSpots + successSpots.length >= total)
                    return res.sendGood('Removed spots from lot', successSpots, {errors: errors});
            }
            var next = function(spot) {
                spots.push(spot);
                if (spots.length + failedSpots >= total)
                    process();
            }
            var process = function() {
                lot.removeSpots(spots, function(err, success) {
                    if (err && (success == null || success.length < 1)) {
                        if (err instanceof Array) 
                            return res.sendBad(err);
                        else
                            return res.sendBad(err);
                    }
                    spots.forEach(function(spot) {
                        if (spot == null || success.indexOf(spot.id) < 0)
                            return spotFailed('Spot ' + (spot || {}).id + ' could not be removed');
                        spot.number = null;
                        spot.save(function(err) {
                            if (err)
                                return spotFailed(err);
                            done(spot);
                        })
                    });
                })
            }
            var findSpots = function(spots) {
                spots.forEach(function(spot) {
                    if (typeof spot === 'string')
                        app.db.spots.findById(spot, function(err, spot) {
                            if (err)
                                return spotFailed(err);
                            if (spot == null)
                                return spotFailed('Spot not found');
                            next(spot);
                        });
                    else
                        next(spot);
                })    
            }
            if (req.body.spots) {
                if (!(req.body.spots instanceof Array))
                    req.body.spots = [req.body.spots];
                total = req.body.spots.length;
                findSpots(req.body.spots);
            }
            else if (req.body.from &&
                     typeof req.body.from === 'number' && 
                     req.body.to &&
                     typeof req.body.to === 'number') {
                if (req.body.from < Lot.spotNumbersRange.min ||
                    req.body.to > Lot.spotNumbersRange.max)
                    return res.sendBad('Specified range is invalid. Must be within: ' + 
                                                Lot.spotNumbersRange.min + '-' +
                                                Lot.spotNumbersRange.max)
                app.db.spots.find({
                    _id: {$in: lot.spots}, 
                    number: {$gte: req.body.from, $lte: req.body.to}
                }, function(err, spots) {
                    if (err)
                        return res.sendBad(err);
                    if (spots == null || spots.length <= 0)
                        return res.sendBad('Could not find spots in given range');
                    total = spots.length;
                    findSpots(spots);
                })
            }
            else {
                return res.sendBad('Your request was bad')
            }
        })
    }
}

module.exports = controller;