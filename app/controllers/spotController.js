var Errors = require('./../errors');
var ObjectId = require('mongoose').Types.ObjectId;
var Booking = require('./../models/Booking');
var Spot = require('./../models/Spot');
var Car = require('./../models/Car');

var controller = function(app) {
    this.app = app;
    app.get('/api/spots', app.checkAuth, app.checkAttendant.bind(app), this.GetAllSpots.bind(this));
    app.put('/api/spots', app.checkAuth, app.bodyParser.json(), this.CreateSpot.bind(this));
    app.get('/api/spots/near', this.GetNearestSpot.bind(this));
    app.get('/api/spots/:id', app.checkAuth, app.checkAttendant.bind(app), this.GetSpot.bind(this));
    app.get('/api/spots/:id/lot', app.checkAuth, app.checkAttendant.bind(app), this.GetLotForSpot.bind(this));
    app.put('/api/spots/:id/lot', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetLotForSpot.bind(this));
    app.put('/api/spots/:id/lot/remove', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.RemoveLotFromSpot.bind(this));
    app.get('/api/spots/:id/location', app.checkAuth, app.checkAttendant.bind(app), this.GetLocationOfSpot.bind(this));
    app.get('/api/spots/:id/price', app.checkAuth, app.checkAttendant.bind(app), this.GetPriceOfSpot.bind(this));
    app.put('/api/spots/:id/price', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetPriceOfSpot.bind(this));
    app.get('/api/spots/:id/name', app.checkAuth, app.checkAttendant.bind(app), this.GetNameOfSpot.bind(this));
    app.put('/api/spots/:id/name', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetNameOfSpot.bind(this));
    app.get('/api/spots/:id/reserved', app.checkAuth, app.checkAttendant.bind(app), this.GetIfSpotIsReserved.bind(this));
    app.put('/api/spots/:id/reserved', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetIfSpotIsReserved.bind(this));
    app.get('/api/spots/:id/description', app.checkAuth, app.checkAttendant.bind(app), this.GetDescriptionOfSpot.bind(this));
    app.put('/api/spots/:id/description', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SetDescriptionOfSpot.bind(this));
    app.get('/api/spots/:id/attendants', app.checkAuth, app.checkOwner.bind(app), this.GetAttendantsForSpot.bind(this));
    app.put('/api/spots/:id/attendants', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.AddAttendantsToSpot.bind(this));
    app.get('/api/spots/:id/bookings', app.checkAuth, app.checkAttendant.bind(app), this.GetAllBookingsForSpot.bind(this));
    app.put('/api/spots/:id/bookings', app.checkAuth, app.checkAttendant.bind(app), app.bodyParser.json(), this.AddBookingsToSpot.bind(this));
    app.put('/api/spots/:id/bookings/remove', app.checkAuth, app.checkAttendant.bind(app), app.bodyParser.json(), this.RemoveBookingsFromSpot.bind(this));
    app.get('/api/spots/:id/available', app.checkAuth, app.checkAttendant.bind(app), this.GetAllAvailabilityOfSpot.bind(this));
    app.put('/api/spots/:id/available', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.AddAvailabilityToSpot.bind(this));
    app.put('/api/spots/:id/available/remove', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.RemoveAvailabilityFromSpot.bind(this));
    app.get('/api/spots/:id/booked', app.checkAuth, app.checkAttendant.bind(app), this.GetAllBookedTimeOfSpot.bind(this));
    app.get('/api/spots/:id/schedule', app.checkAuth, app.checkAttendant.bind(app), this.GetEntireScheduleOfSpot.bind(this));
}

controller.prototype = {
    GetAllSpots: function(req, res) {
        res.sendGood('Found spots', req.docs.map(function(doc) { 
            return doc.toJSON({getters: true}) 
        }));
    },
    CreateSpot: function(req, res) {
        var app = this.app;
        var newSpot = new Spot(req.body.spot || req.body);
        delete newSpot._id;
        var getLocationFromLot = null;
        if (newSpot.lot)
            getLocationFromLot = app.db.lots.findById(newSpot.lot instanceof ObjectId ? newSpot.lot : newSpot.lot.id || newSpot.lot._id);
        else if (newSpot.location && newSpot.location.address)
            var address = newSpot.location.address;
        else
            return res.sendBad(new Errors.BadInput('location.address', 'create spot'));
        if (req.user && !newSpot.user)
            newSpot.user = req.user.id;
        (
            !!getLocationFromLot ? getLocationFromLot.then(function(lot) {
                if (lot.getPrice())
                    newSpot.price = lot.getPrice();
                if (lot.available.ranges.length)
                    newSpot.available = lot.available.ranges;
                return Promise.resolve(lot.location);
            }) : app.geocoder.geocode(address).then(function(loc) {
                return Promise.resolve({
                    coordinates: [loc[0].longitude, loc[0].latitude],
                    address: loc[0].formattedAddress
                })
            })
        )
        .then(function(location) {
            if (!location)
                throw new Errors.BadInput('location', 'create spot');
            newSpot.location = location;
            if (!newSpot.getPrice())
                throw new Errors.BadInput('price', 'create spot');
            newSpot = newSpot.toJSON({getters: true})
            if (req.body.count != null) {
                if (typeof req.body.count !== 'number' || req.body.count <= 0)
                    throw new Errors.BadInput('count', 'create spot');
                var arr = [];
                for (var i=0;i<req.body.count;i++)
                    arr.push(newSpot);
                return app.db.spots.collection.insert(arr);
            }
            else {
                return app.db.spots.create(newSpot);
            }
        })
        .then(function(results) {
            results = results.ops || results;
            if (results.toJSON)
                results = results.toJSON({getters: true});
            res.sendGood('Created new spots', results);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetNearestSpot: function(req, res) {
        if (isNaN(req.query.long) || isNaN(req.query.lat))
            return res.sendBad(new Errors.BadInput(['longitude', 'latitude'], 'find nearest spots'));

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
            if (!lot) throw new Errors.NotFound('Lot', req.doc.lot);
            res.sendGood('Found lot', lot.toJSON({getters: true}));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    RemoveLotFromSpot: function(req, res) {
        req.doc.removeLot()
        .then(function(spot) {
            res.sendGood('Removed lot from spot', spot);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    SetLotForSpot: function(req, res) {
        this.app.db.lots.findById(req.body.id)
        .exec()
        .then(function(lot) {
            if (!lot) throw new Errors.NotFound('Lot', req.body.id);
            return req.doc.setLot(lot);
        })
        .then(function(b) {
            res.sendGood('Set lot for spot', b);
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    GetLocationOfSpot: function(req, res) {
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
        var cars = new Array(bookings.length);
        var carsToFind = new Array(cars.length);
        var carsToCreate = new Array(cars.length);
        for (var i=0; i<bookings.length; i++) {
            var booking = bookings[i];
            if (!booking.start || !booking.end ||
                isNaN(new Date(booking.start).valueOf()) ||
                isNaN(new Date(booking.end).valueOf()))
                return res.sendBad(new Errors.BadInput(['start', 'end'], 'create booking'));
            if (!booking.car) {
                if(!booking.license)
                    return res.sendBad(new Errors.BadInput(['car', 'license']));
                else
                    carsToFind[i] = {license: booking.license};
            }
            else carsToFind[i] = booking.car;
        }
        spot = req.doc;
        Promise.all(carsToFind.map(function(car) {
            if (typeof car === 'string')
                return app.db.cars.findById(car);
            if (car instanceof ObjectId)
                return app.db.cars.findById(car.toString());
            if (car.id || car._id)
                return app.db.cars.findById(car.id || car._id);
            if (car.license)
                return app.db.cars.findOne(car);
            else
                throw new Error('Yeah I have no idea what happenned. Something to do with the cars input.');
        }))
        .then(function(carsFound) {
            for (var i=0;i<carsFound.length;i++) {
                var carFound = carsFound[i];
                if (!carFound) {
                    if (!req.body.createCarIfNotInSystem)
                        return res.sendBad(new Errors.BadInput('car'));
                    else {
                        if (carsToFind[i] instanceof Car)
                            carsToCreate[i] = carsToFind[i].save();
                        else if (carsToFind[i].license)
                            carsToCreate[i] = new Car(carsToFind[i]).save();
                        else
                            throw new Errors.NotFound('Car', {id: carsToFind[i]})
                    }
                }
                else cars[i] = carFound;
            }
            return Promise.all(carsToCreate)
        })
        .then(function(carsCreated) {
            for (var i=0; i<carsCreated.length; i++) {
                if (carsCreated[i])
                    cars[i] = carsCreated[i];
            }
            return Promise.resolve(cars);
        })
        .then(function(cars) {
            return Promise.all(bookings.map(function(booking, i) {
                var b = new Booking(booking);
                b.car = cars[i];
                if (req.user && !b.user)
                    b.user = req.user.id;
                return b.setSpot(spot);
            }))
        })
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
            return res.sendBad('BAD INPUT Could not remove bookings as no bookings were found');

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
    GetAllAvailabilityOfSpot: function(req, res) {
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
    GetAllBookedTimeOfSpot: function(req, res) {
        res.sendGood('Found booked time for spot', {booked: req.doc.booked.ranges});
    },
    GetEntireScheduleOfSpot: function(req, res) {
        res.sendGood('Found schedules for spot', {
            available: req.doc.available.ranges,
            booked: req.doc.booked.ranges
        });
    },
    GetPriceOfSpot: function(req, res) {
        var price = req.doc.getPrice();
        if (!price) return res.sendBad(new Errors.MissingProperty(req.doc, 'price', req.doc.getPrice()));
        res.sendGood('Found price for spot', price);
    },
    SetPriceOfSpot: function(req, res) {
        req.doc.setPrice(req.body)
        .then(function(spot) {
            res.sendGood('Set price for spot', spot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetNameOfSpot: function(req, res) {
        var name = req.doc.getName();
        if (!name) return res.sendBad(new Errors.MissingProperty(req.doc, 'name', req.doc.getName()));
        res.sendGood('Found name for spot', name);
    },
    SetNameOfSpot: function(req, res) {
        req.doc.setName(req.body.name)
        .then(function(spot) {
            res.sendGood('Set name for spot', spot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetIfSpotIsReserved: function(req, res) {
        var reserved = req.doc.getReserved();
        if (!reserved) return res.sendBad(new Errors.MissingProperty(req.doc, 'reserved', req.doc.getReserved()));
        res.sendGood('Found reserved for spot', reserved);
    },
    SetIfSpotIsReserved: function(req, res) {
        req.doc.setReserved(req.body.reserved)
        .then(function(spot) {
            res.sendGood('Set reserved for spot', spot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetDescriptionOfSpot: function(req, res) {
        var description = req.doc.getDescription();
        if (!description) return res.sendBad(new Errors.MissingProperty(req.doc, 'description', req.doc.getDescription()));
        res.sendGood('Found description for spot', description);
    },
    SetDescriptionOfSpot: function(req, res) {
        req.doc.setDescription(req.body.description)
        .then(function(spot) {
            res.sendGood('Set description for spot', spot);
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetAttendantsForSpot: function(req, res) {
        this.app.db.users.find({id: {$in: req.doc.attendants}})
        .then(function(attendants) {
            if (!attendants) throw new Errors.MissingProperty(req.doc, 'attendants', false);
            res.sendGood('Found attendants', attendants);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    AddAttendantsToSpot: function(req, res) {
        if (!req.body.attendants)
            return res.sendBad(new Errors.BadInput('attendants'));
        var ids = (req.body.attendants instanceof Array ? req.body.attendants : [req.body.attendants])
            .map(function(att) {
                return att.id || att._id || att;
            })
        this.app.db.users.find({_id: {$in: ids}})
        .then(function(attendants) {
            return req.doc.addAttendants(attendants);
        })
        .then(function(spot) {
            res.sendGood('Added attendants', spot);
        })
        .catch(function(err) {
            return res.sendBad(err);
        })
    }
}

module.exports = controller;