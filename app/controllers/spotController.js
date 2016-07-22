var Errors = require('./../errors');
var ObjectId = require('mongoose').Types.ObjectId;
var Booking = require('./../models/Booking');
var Spot = require('./../models/Spot');

var controller = function(app) {
    this.app = app;
    app.get('/api/spots', app.checkAuth, app.checkAdmin, this.GetAllSpots.bind(this));
    app.put('/api/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateSpot.bind(this));
    app.get('/api/spots/near', this.GetNearestSpot.bind(this));
    app.get('/api/spots/:id', app.checkAuth, app.checkOwner, this.GetSpot.bind(this));
    app.get('/api/spots/:id/lot', app.checkAuth, app.checkOwner, this.GetLotForSpot.bind(this));
    app.put('/api/spots/:id/lot', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.SetLotForSpot.bind(this));
    app.put('/api/spots/:id/lot/remove', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.DisassociateLotFromSpot.bind(this));
    app.get('/api/spots/:id/location', app.checkAuth, app.checkOwner, this.GetLocationForSpot.bind(this));
    app.get('/api/spots/:id/price', app.checkAuth, app.checkOwner, this.GetPriceForSpot.bind(this));
    app.put('/api/spots/:id/price', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.SetPriceForSpot.bind(this));
    app.get('/api/spots/:id/bookings', app.checkAuth, app.checkOwner, this.GetAllBookingsForSpot.bind(this));
    app.put('/api/spots/:id/bookings', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.AddBookingsToSpot.bind(this));
    app.put('/api/spots/:id/bookings/remove', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.RemoveBookingsFromSpot.bind(this));
    app.get('/api/spots/:id/available', app.checkAuth, app.checkOwner, this.GetAllAvailabilityForSpot.bind(this));
    app.put('/api/spots/:id/available', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.AddAvailabilityToSpot.bind(this));
    app.put('/api/spots/:id/available/remove', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.RemoveAvailabilityFromSpot.bind(this));
    app.get('/api/spots/:id/booked', app.checkAuth, app.checkOwner, this.GetAllBookedTimeForSpot.bind(this));
    app.get('/api/spots/:id/schedule', app.checkAuth, app.checkOwner, this.GetEntireScheduleForSpot.bind(this));
}

controller.prototype = {
    GetAllSpots: function(req, res) {
        this.app.db.spots.find({})
        .exec()
        .then(function(docs) {
            res.sendGood('Found spots', docs.map(function(d) {
                return d.toJSON({getters: true});
            }));
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    CreateSpot: function(req, res) {
        var app = this.app;
        var newSpot = new Spot(req.body.spot || req.body);
        delete newSpot._id;
        var getLocationFromLot = null;
        if (newSpot.lot)
            getLocationFromLot = app.db.lots.findById(newSpot.lot instanceof ObjectId ? newSpot.lot : newSpot.lot.id || newSpot.lot._id);
        else if (newSpot.location && newSpot.location.coordinates)
            var coords = {
                lon: newSpot.location.coordinates[0] || newSpot.location.coordinates.long || newSpot.location.coordinates.lon,
                lat: newSpot.location.coordinates[1] || newSpot.location.coordinates.lat
            }
        else
            return res.sendBad('Could not create spot because no coordinates were specified');
        if (req.user && !newSpot.user)
            newSpot.user = req.user.id;
        (
            !!getLocationFromLot ? getLocationFromLot.then(function(lot) {
                if (lot.getPrice())
                    newSpot.price = lot.getPrice();
                if (lot.available.ranges.length)
                    newSpot.available = lot.available.ranges;
                return Promise.resolve(lot.location);
            }) : app.geocoder.reverse(coords).then(function(loc) {
                return Promise.resolve({
                    coordinates: [loc[0].longitude, loc[0].latitude],
                    address: loc[0].formattedAddress
                })
            })
        )
        .then(function(location) {
            if (!location)
                throw 'Cannot create a spot without a location';
            newSpot.location = location;
            if (!newSpot.getPrice())
                    throw 'Could not create spot because no price was specified';
            newSpot = newSpot.toJSON({getters: true})
            if (req.body.count != null) {
                if (typeof req.body.count !== 'number' || req.body.count <= 0)
                    return res.sendBad('Could not create spot as the specified count was invalid');
                var arr = [];
                for (var i=0;i<req.body.count;i++)
                    arr.push(newSpot);
                return this.app.db.spots.collection.insert(arr);
            }
            else {
                return this.app.db.spots.create(newSpot);
            }
        })
        .then(function(results) {
            res.sendGood('Created new spots', results.ops || results);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
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
        
        query
        .exec()
        .then(function(docs) {
            res.sendGood('Found nearest spots', {spots: docs});
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    GetSpot: function(req, res) {
        res.sendGood('Found spot', req.doc.toJSON({getters: true}));
    },
    GetLotForSpot: function(req, res) {
        if (!req.doc.lot)
            return res.sendBad(new Errors.MissingProperty(req.doc, 'lot'));
        this.app.db.lots.findById(req.doc.lot)
        .exec()
        .then(function(lot) {
            if (!lot) throw 'Could not find associated lot';
            res.sendGood('Found lot', lot.toJSON({getters: true}));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    DisassociateLotFromSpot: function(req, res) {
        req.doc.removeLot()
        .then(function(spot) {
            res.sendGood('Disassociated lot from spot', spot);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    SetLotForSpot: function(req, res) {
        this.app.db.lots.findById(req.body.id)
        .exec()
        .then(function(lot) {
            if (!lot) throw 'Could not find lot';
            return req.doc.setLot(lot);
        })
        .then(function(b) {
            res.sendGood('Set lot for spot', b);
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    GetLocationForSpot: function(req, res) {
        var loc = {
            address: req.doc.getAddress(),
            coordinates: req.doc.getLocation()
        }
        res.sendGood('Got location for spot', {location: loc});
    },
    GetAllBookingsForSpot: function(req, res) {
        this.app.db.bookings.find({spot: req.doc.id})
        .exec()
        .then(function(bookings) {
            if (!bookings) throw new Errors.MissingProperty(req.doc, 'bookings', false);
            res.sendGood('Found bookings', bookings);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    AddBookingsToSpot: function(req, res) {
        var bookings = req.body.bookings || req.body;
        if (!(bookings instanceof Array)) bookings = [bookings];
        for (var i=0; i<bookings.length; i++) {
            var booking = bookings[i];
            if (!booking.start || !booking.end ||
                isNaN(new Date(booking.start).valueOf()) ||
                isNaN(new Date(booking.end).valueOf()))
                return res.sendBad('Could not create booking as valid start and end times were not provided') 
        }
        spot = req.doc;
        Promise.all(bookings.map(function(booking) {
            var b = new Booking(booking);
            if (req.user && !b.user)
                b.user = req.user.id;
            return b.setSpot(spot);
        }))
        .then(function(results) {
            return spot.addBookings(results);
        })
        .then(function() {
            res.sendGood('Added bookings to spot', {
                spot: spot,
                bookings: bookings
            })
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    RemoveBookingsFromSpot: function(req, res) {
        var bookings = req.body.bookings || [req.body];
        if (!(bookings instanceof Array)) bookings = [bookings];
        var errs = [];
        var search = []
        bookings.forEach(function(booking) {
            var _search = {};
            if (booking.id || booking._id)
                _search._id = ObjectId(booking.id || booking._id);
            else if (booking.start && booking.end) {
                _search.start = booking.start,
                _search.end = booking.end
            }
            if (Object.keys(_search).length)
                search.push(_search);
            else
                errs.push('Could not remove booking: ' + JSON.stringify(booking));
        })
        if (errs.length)
            return res.sendBad(errs);
        if (!search.length)
            return res.sendBad('Could not remove bookings as no bookings were found');

        this.app.db.bookings.find().where({spot: req.doc.id}).and([{$or: search}]).exec()
        .then(function(docs) {
            bookings = docs;
            return req.doc.removeBookings(bookings); 
        })
        .then(function(spot) {
            return Promise.all(bookings.map(function(booking) {
                return booking.remove();
            }))
        })
        .then(function(results) {
            res.sendGood('Removed bookings from the spot', results);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetAllAvailabilityForSpot: function(req, res) {
        res.sendGood('Found availability for spot', {available: req.doc.available.ranges});
    },
    AddAvailabilityToSpot: function(req, res) {
        req.doc.addAvailability(req.body.schedules || req.body)
        .then(function(spot) {
            res.sendGood('Added availability to spot');
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    RemoveAvailabilityFromSpot: function(req, res) {
        req.doc.removeAvailability(req.body.schedules || req.body)
        .then(function(spot) {
            res.sendGood('Availability removed from spot');
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetAllBookedTimeForSpot: function(req, res) {
        res.sendGood('Found booked time for spot', {booked: req.doc.booked.ranges});
    },
    GetEntireScheduleForSpot: function(req, res) {
        res.sendGood('Found schedules for spot', {
            available: req.doc.available.ranges,
            booked: req.doc.booked.ranges
        });
    },
    GetPriceForSpot: function(req, res) {
        var price = req.doc.getPrice();
        if (!price) return res.sendBad('Price is not set for this spot');
        res.sendGood('Found price for spot', price);
    },
    SetPriceForSpot: function(req, res) {
        req.doc.setPrice(req.body)
        .then(function(spot) {
            res.sendGood('Set price for spot', spot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    }
}

module.exports = controller;