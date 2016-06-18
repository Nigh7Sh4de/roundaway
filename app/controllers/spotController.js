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
            return res.sendGood('Found spots', {spots: docs});
        });
    },
    CreateSpot: function(req, res) {
        var newSpot = new Spot(req.body.spot).toJSON();
        delete newSpot._id;
        if (req.body.count != null) {
            if (typeof req.body.count !== 'number' || req.body.count <= 0)
                return res.sendBad('Could not create spot as the specified count was invalid');
            var arr = [];
            for (var i=0;i<req.body.count;i++)
                arr.push(newSpot);
            this.app.db.spots.collection.insert(arr, function(err, result) {
                if (err)
                    return res.sendBad(err);
                res.sendGood('Created spots', result);
            })
        }
        else {
            this.app.db.spots.create(newSpot, function(err, result) {
                if (err)
                    return res.sendBad(err);
                res.sendGood('Created spot', result);
            })    
        }
    },
    GetNearestSpot: function(req, res) {
        if (isNaN(req.query.long) || isNaN(req.query.lat))
            return res.sendBad('Cannot find nearest spots, you must specify valid long and lat');

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
            if (err)
                return res.sendBad(err);
            else {
                return res.sendGood('Found nearest spots', {spots: docs});
            }
        });
    },
    GetSpot: function(req, res) {
        this.app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else
                return res.sendGood('Found spot', {spot: doc});
        })
    },
    GetLocationForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                var loc = {
                    address: doc.getAddress(),
                    coordinates: doc.getLocation()
                }
                return res.sendGood('Got location for spot', {location: loc});
                
            }
        })
    },
    SetLocationForSpot: function(req, res) {
        var coords = req.body.coordinates;
        if (!coords)
            return res.sendBad('Cannot set location, you must supply coordinates');
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, spot) {
            if (err) {
                return res.sendBad(err);
            }
            else {
                if (coords instanceof Array)
                    coords = {long:coords[0], lat:coords[1]};
                if (coords.lon == null)
                    coords.lon = coords.long;
                if (coords.long !== undefined)
                    delete coords.long;
                app.geocoder.reverse(coords, function(err, loc) {
                    spot.setLocation(coords, loc[0].formattedAddress, function(err) {
                        if (err)
                            return res.sendBad(err);
                        else res.sendGood('Location set for spot');
                    });
                })    
            }
        });
    },
    GetAllBookingsForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                var result = [];
                var errs = [];
                var bookings = doc.getBookings();
                var next = function(obj) {
                    if (typeof obj === 'string')
                        errs.push(obj);
                    else
                        result.push(obj);

                    if (errs.length >= bookings.length)
                        return res.sendBad('Failed to find bookings attached to this spot');
                    else if (result.length + errs.length >= bookings.length)
                        return res.sendGood('Found bookings', result, {errors: errs});
                }
                if (bookings.length > 0)
                    bookings.forEach(function(booking) {
                        app.db.bookings.findById(booking, function(err, doc) {
                            if (err)
                                next('Could not find booking ' + booking + ': ' + err);
                            else if (doc == null)
                                next('Could not find booking ' + booking);
                            else
                                next(doc);
                        })
                    });
                else
                    return res.sendGood('This spot does not have any bookings', {bookings: bookings});
            }
        })
    },
    AddBookingsToSpot: function(req, res) {
        var app = this.app;
        if (!req.body.bookings)
            return res.sendBad('Cannot add bookings, you must supply bookings parameter');
        if (!(req.body.bookings instanceof Array))
            req.body.bookings = [req.body.bookings];
        var firstType = typeof req.body.bookings[0];
        for (var i=0; i < req.body.bookings.length; i++) {
            var booking = req.body.bookings[i];
            if (typeof booking !== firstType || (typeof booking !== 'string' && typeof booking !== 'object'))
                return res.sendBad('Cannot add bookings, all bookings must be either id\'s or objects.');
            else if (typeof booking === 'object' && (!booking.id || !booking.start || !booking.end))
                return res.sendBad('Cannot add bookings, Booking objects must have properties: id, start, end');
        };
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                var updatedBookings = 0;
                var errs = [];
                var updateBooking = function(booking, total) {
                    booking.setSpot(doc, function(err) {
                        if (err)
                            errs.push(err);
                        if (++updatedBookings >= total) {
                            if (errs.length == 0)
                                res.sendGood('Added bookings to spot');
                            else
                                res.sendBad(errs, {
                                    message: 'Some bookings could not be updated',
                                    bookingsToUpdate: bookings,
                                    spot: doc
                                })
                        }
                    })
                }
                var addBookings = function(bookings) {
                    doc.addBookings(bookings, function(err) {
                        if (err)
                            return res.sendBad(err);
                        else {
                            bookings.forEach(function(booking) {
                                updateBooking(booking, bookings.length);
                            })
                        }
                    })
                }
                if (typeof req.body.bookings[0] === 'string')
                    app.db.bookings.find({_id: {$in: req.body.bookings}}, function(err, bookings) {
                        if (err)
                            return res.sendBad(err);
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
            return res.sendBad('Cannot remove bookings, you must supply bookings parameter');
        if (!(req.body.bookings instanceof Array))
            req.body.bookings = [req.body.bookings];
        var firstType = typeof req.body.bookings[0];
        req.body.bookings.forEach(function(booking) {
            if (typeof booking !== firstType || (typeof booking !== 'string' && typeof booking !== 'object'))
                return res.sendBad('Cannot remove bookings, all bookings must be either id\'s or objects');
            else if (typeof booking === 'object' && (!booking.id || !booking.start || !booking.end))
                return res.sendBad('Cannot remove bookings, Booking objects must have properties: id, start, end');
        });
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                var removeBookings = function(bookings) {
                    doc.removeBookings(bookings, function(err) {
                        if (err)
                            return res.sendBad(err);
                        else
                            return res.sendGood('Bookings removed from spot');
                    })
                }
                if (typeof req.body.bookings[0] === 'string')
                    app.db.bookings.find({_id: {$in: req.body.bookings}}, function(err, bookings) {
                        if (err)
                            return res.sendBad(err);
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
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                return res.sendGood('Found availability for spot', {available: doc.available.ranges});
            }
        });
    },
    AddAvailabilityToSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                doc.addAvailability(req.body.schedules || req.body, function(err) {
                    if (err)
                        return res.sendBad(err);
                    else
                        return res.sendGood('Added availability to spot');
                })
            }
        });
    },
    RemoveAvailabilityFromSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                doc.removeAvailability(req.body.schedules || req.body, function(err) {
                    if (err)
                        return res.sendBad(err);
                    else
                        return res.sendGood('Availability removed from spot');
                })
            }
        });
    },
    GetAllBookedTimeForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                return res.sendGood('Found booked time for spot', {booked: doc.booked.ranges});
            }
        });
    },
    GetEntireScheduleForSpot: function(req, res) {
        var app = this.app;
        app.db.spots.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (doc == null)
                return res.sendBad('Spot not found');
            else {
                return res.sendGood('Found schedules for spot', {
                        available: doc.available.ranges,
                        booked: doc.booked.ranges
                    });
            }
        });
    }
}

module.exports = controller;