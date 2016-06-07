var Spot = require('./../models/Spot');

var controller = function(app) {
    this.app = app;
    app.get('/api/spots', app.checkAuth, app.checkAdmin, this.GetAllSpots.bind(this));
    app.put('/api/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateSpot.bind(this));
    app.get('/api/spots/near', app.checkAuth, app.checkAdmin, this.GetNearestSpot.bind(this));
    app.get('/api/spots/:id', app.checkAuth, app.checkAdmin, this.GetSpot.bind(this));
    app.get('/api/spots/:id/location', app.checkAuth, app.checkAdmin, this.GetLocationForSpot.bind(this));
    app.post('/api/spots/:id/location', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetLocationForSpot.bind(this));
    app.get('/api/spots/:id/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookingsForSpot.bind(this));
    app.put('/api/spots/:id/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddBookingsToSpot.bind(this));
    app.put('/api/spots/:id/bookings/remove', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.RemoveBookingsFromSpot.bind(this));
    app.get('/api/spots/:id/available', app.checkAuth, app.checkAdmin, this.GetAllAvailabilityForSpot.bind(this));
    app.put('/api/spots/:id/available', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddAvailabilityToSpot.bind(this));
    app.put('/api/spots/:id/available/remove', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.RemoveAvailabilityFromSpot.bind(this));
    app.get('/api/spots/:id/booked', app.checkAuth, app.checkAdmin, this.GetAllBookedTimeForSpot.bind(this));
    app.get('/api/spots/:id/schedule', app.checkAuth, app.checkAdmin, this.GetEntireScheduleForSpot.bind(this));
}

controller.prototype = {
    GetAllSpots: function(req, res) {
        this.app.db.spots.find({}, function(err, docs) {
            return res.send(docs);
        });
    },
    CreateSpot: function(req, res) {
        var newSpot = new Spot(req.body.spot).toJSON();
        delete newSpot._id;
        if (req.body.count != null) {
            if (typeof req.body.count !== 'number' || req.body.count <= 0)
                return res.status(500).send('Could not create spot. Specified count was invalid.');
            var arr = [];
            for (var i=0;i<req.body.count;i++)
                arr.push(newSpot);
            this.app.db.spots.collection.insert(arr, function(err, result) {
                if (err != null)
                    return res.send({status: 'ERROR', error: err});
                res.send({status: 'SUCCESS', result: result});
            })
        }
        else {
            this.app.db.spots.create(newSpot, function(err, result) {
                if (err != null)
                    return res.send({status: 'ERROR', error: err});
                res.send({status: 'SUCCESS', result: result});
            })    
        }
    },
    GetNearestSpot: function(req, res) {
        if (isNaN(req.query.long) || isNaN(req.query.lat))
            return res.status(500).send('Cannot find nearest spots. Must specify valid long and lat.');

        var coordinates = [
            parseFloat(req.query.long),
            parseFloat(req.query.lat)
        ];

        var requiredAvailableDate = new Date(req.query.available);
        var query = this.app.db.spots.find({"location.coordinates": {$near:{$geometry:{ type: "Point", coordinates: coordinates }}}})
        if (!isNaN(requiredAvailableDate.valueOf()))
            query.elemMatch("available", {
                start: {$lte: requiredAvailableDate},
                end: {$gte: requiredAvailableDate}
            })
        if (!isNaN(req.query.count))
            query.limit(parseInt(req.query.count));
        query.exec(function(err, docs) {
            if (err != null)
                return res.status(500).send(err);
            else {
                return res.send(docs);
            }
        });
    },
    GetSpot: function(req, res) {
        this.app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else
                return res.send(doc);
        })
    },
    GetLocationForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                var loc = {
                    address: doc.getAddress(),
                    coordinates: doc.getLocation()
                }
                return res.send(loc);
                
            }
        })
    },
    SetLocationForSpot: function(req, res) {
        var coords = req.body.coordinates;
        if (!coords)
            return res.status(500).send('Cannot set location. Must supply coordinates.');
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, spot) {
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
                app.geocoder.reverse(coords, function(err, loc) {
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
                    spot.setAddress(loc.formattedAddress, next);
                    spot.setLocation(coords, next);
                })    
            }
        });
    },
    GetAllBookingsForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                var result = [];
                var bookings = doc.getBookings();
                var next = function(obj) {
                    result.push(obj);
                    if (result.length >= bookings.length)
                        return res.send(result);
                }
                if (bookings.length > 0)
                    bookings.forEach(function(booking) {
                        app.db.bookings.findById(booking, function(err, doc) {
                            if (err != null)
                                next('Could not find booking ' + booking + ': ' + err.message);
                            else if (doc == null)
                                next('Could not find booking ' + booking);
                            else
                                next(doc);
                        })
                    });
                else
                    return res.send(bookings);
            }
        })
    },
    AddBookingsToSpot: function(req, res) {
        var app = this.app;
        if (!req.body.bookings)
            return res.status(500).send('Cannot add bookings. Must supply bookings parameter.');
        if (!(req.body.bookings instanceof Array))
            req.body.bookings = [req.body.bookings];
        var firstType = typeof req.body.bookings[0];
        for (var i=0; i < req.body.bookings.length; i++) {
            var booking = req.body.bookings[i];
            if (typeof booking !== firstType || (typeof booking !== 'string' && typeof booking !== 'object'))
                return res.status(500).send('Cannot add bookings. All bookings must be either id\'s or objects.');
            else if (typeof booking === 'object' && (!booking.id || !booking.start || !booking.end))
                return res.status(500).send('Cannot add bookings. Booking objects must have properties: id, start, end');
        };
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                var updatedBookings = 0;
                var errs = [];
                var updateBooking = function(booking, total) {
                    booking.setSpot(doc, function(err) {
                        if (err != null)
                            errs.push(err);
                        if (++updatedBookings >= total) {
                            if (errs.length == 0)
                                res.sendStatus(200);
                            else
                                res.status(500).send({
                                    status: 'ERROR',
                                    message: 'Some bookings could not be updated',
                                    errors: errs,
                                    bookingsToUpdate: bookings,
                                    spot: doc
                                })
                        }
                    })
                }
                var addBookings = function(bookings) {
                    doc.addBookings(bookings, function(err) {
                        if (err != null)
                            return res.status(500).send(err);
                        else {
                            bookings.forEach(function(booking) {
                                updateBooking(booking, bookings.length);
                            })
                        }
                    })
                }
                if (typeof req.body.bookings[0] === 'string')
                    app.db.bookings.find({_id: {$in: req.body.bookings}}, function(err, bookings) {
                        if (err != null)
                            return res.status(500).send(err);
                        addBookings(bookings);
                    })
                else
                    addBookings(req.body.bookings);
            }
        });
    },
    RemoveBookingsFromSpot: function(req, res) {
        var app = this.app;
        if (!req.body.bookings)
            return res.status(500).send('Cannot remove bookings. Must supply bookings parameter.');
        if (!(req.body.bookings instanceof Array))
            req.body.bookings = [req.body.bookings];
        var firstType = typeof req.body.bookings[0];
        req.body.bookings.forEach(function(booking) {
            if (typeof booking !== firstType || (typeof booking !== 'string' && typeof booking !== 'object'))
                return res.status(500).send('Cannot remove bookings. All bookings must be either id\'s or objects.');
            else if (typeof booking === 'object' && (!booking.id || !booking.start || !booking.end))
                return res.status(500).send('Cannot remove bookings. Booking objects must have properties: id, start, end');
        });
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                var removeBookings = function(bookings) {
                    doc.removeBookings(bookings, function(err) {
                        if (err != null)
                            return res.status(500).send(err);
                        else
                            return res.sendStatus(200);
                    })
                }
                if (typeof req.body.bookings[0] === 'string')
                    app.db.bookings.find({_id: {$in: req.body.bookings}}, function(err, bookings) {
                        if (err != null)
                            return res.status(500).send(err);
                        removeBookings(bookings);
                    })
                else
                    removeBookings(req.body.bookings);
            }
        });
    },
    GetAllAvailabilityForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                return res.send(doc.available.ranges);
            }
        });
    },
    AddAvailabilityToSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                doc.addAvailability(req.body.schedules || req.body, function(err) {
                    if (err != null)
                        return res.status(500).send({status: 'ERROR', error: err});
                    else
                        return res.sendStatus(200);
                })
            }
        });
    },
    RemoveAvailabilityFromSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                doc.removeAvailability(req.body.schedules || req.body, function(err) {
                    if (err != null)
                        return res.status(500).send({status: 'ERROR', error: err});
                    else
                        return res.sendStatus(200);
                })
            }
        });
    },
    GetAllBookedTimeForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                return res.send(doc.booked.ranges);
            }
        });
    },
    GetEntireScheduleForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Spot not found.');
            else {
                return res.send({
                        available: doc.available.ranges,
                        booked: doc.booked.ranges
                    });
            }
        });
    }
}

var init = function(app) {
    app.get('/api/spots/near', app.checkAuth, app.checkAdmin, function(req, res)  {
        if (isNaN(req.query.long) || isNaN(req.query.lat))
            return res.send("Got invalid coordinates");

        var coordinates = [
            parseFloat(req.query.long),
            parseFloat(req.query.lat)
        ];

        app.db.find('spots', {location: {$near:{$geometry:{ type: "Point", coordinates: coordinates }}}}, function(err, doc) {
            if (err != null)
                return res.send(err);
            else {
                return res.send(doc);
            }
        });

    });
}

module.exports = controller;