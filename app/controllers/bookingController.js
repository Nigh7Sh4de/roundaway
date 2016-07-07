var Booking = require('./../models/Booking');

var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkAdmin, this.GetBooking.bind(this));
    app.put('/api/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, this.GetSpotForBooking.bind(this));
    app.put('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, this.GetStartOfBooking.bind(this));
    app.put('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetStartOfBooking.bind(this));
    app.get('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, this.GetDurationForBooking.bind(this));
    app.put('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetDurationForBooking.bind(this));
    app.get('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, this.GetEndOfBooking.bind(this));
    app.put('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetEndOfBooking.bind(this));
    app.get('/api/bookings/:id/time', app.checkAuth, app.checkAdmin, this.GetTimeOfBooking.bind(this));
    app.put('/api/bookings/:id/time', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetTimeOfBooking.bind(this));
    app.get('/api/bookings/:id/price', app.checkAuth, app.checkAdmin, this.GetPriceOfBooking.bind(this));
    app.put('/api/bookings/:id/pay', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.PayForBooking.bind(this));
}

controller.prototype = {
    GetAllBookings: function(req, res) {
        this.app.db.bookings.find({}, function(err, docs) {
            if (err)
                return res.sendBad(err);
            else
                return res.sendGood('Found bookings', docs.map(function(doc) { return doc.toJSON({getters: true}) }));
        });
    },
    GetBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            else
                return res.sendGood('Found booking', doc.toJSON({getters: true}));
        })
    },
    CreateBooking: function(req, res) {
        var newBooking = new Booking(req.body.booking).toJSON();
        delete newBooking._id;
        if (req.body.count) {
            if (typeof req.body.count !== 'number' || req.body.count <= 0)
                return res.sendBad('Could not create booking because the specified count was invalid');
            var arr = [];
            for (var i=0;i<req.body.count;i++)
                arr.push(newBooking);
            this.app.db.bookings.collection.insert(arr, function(err, result) {
                if (err)
                    return res.sendBad(err);
                res.sendGood('Created new bookings', result);
            })
        }
        else {
            this.app.db.bookings.create(newBooking, function(err, result) {
                if (err)
                    return res.sendBad(err);
                res.sendGood('Created new booking', result);
            })    
        }
        
    },
    GetSpotForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .populate('spot')
        .exec()
        .then(function(booking) {
            if (!booking)
                throw 'Could not find booking';
            var spot = booking.getSpot();
            if (!spot)
                throw 'This booking does not have a spot associated with it';
            res.sendGood('Found spot', spot.toJSON({getters: true}));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    SetSpotForBooking: function(req, res) {
        var booking, spot;
        var i = 0;
        var total = 2;
        var next = function(err) {
                if (err) {
                    res.sendBad(err);
                done = function() {}
                next = function() {}
            }
            if (++i >= total)
                done();
        }
        var done = function() {
            booking.setSpot(spot, function(err) {
                if (err)
                    return res.sendBad(err);    
                res.sendGood();                
            });
        }
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return next(err);
            else if (!doc)
                return next('Booking not found');
            booking = doc;
            next();
        });
        this.app.db.spots.findById(req.body.id, function(spotErr, spotDoc) {
            if (spotErr)
                return next(spotErr);
            else if (!spotDoc)
                return next('The spot you are trying to set does not exist');
            spot = spotDoc;
            next();
        })
    },
    GetStartOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            res.sendGood('Found start datetime', doc.getStart());
        });
    },
    SetStartOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            doc.setStart(req.body.start, function(err) {
                if (err)
                    return res.sendBad(err);
                res.sendGood();
            })
        });
    },
    GetDurationForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            var dur = doc.getDuration();
            if (!dur)
                return res.sendBad('This booking does not have valid start and/or end dates. Start: ' + doc.getStart() + ', End: ' + doc.getEnd());
            res.sendGood('Found duration', dur);
        })
    },
    SetDurationForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            doc.setDuration(req.body.duration, function(err) {
                    if (err)
                    return res.sendBad(err);
                res.sendGood();
            });
        })
    },
    GetEndOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            res.sendGood('Found end datetime', doc.getEnd());
        });
    },
    SetEndOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            doc.setEnd(req.body.end, function(err) {
                if (err)
                    return res.sendBad(err);
                res.sendGood();
            })
        });
    },
    GetTimeOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            else {
                res.sendGood('Found time of booking', {
                    start: doc.getStart() || 'This booking does not have a start time',
                    end: doc.getEnd() || 'This booking does not have a start time',
                })
            }
        });
    },
    SetTimeOfBooking: function(req, res) {
        if (!req.body.start && !req.body.end)
            return res.sendBad('Could not set time of booking, you must specify start and/or end times');
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            else {
                var errs = [];
                var count = 0;
                var next = function(err) {
                    count++;
                    if (err)
                        errs.push(err);
                    if (count >= 2)
                        done();
                }
                var done = function() {
                    if (errs.length == 0)
                        res.sendGood();
                    else
                        res.sendBad(errs);
                }
                if (req.body.start)
                    doc.setStart(req.body.start, next);
                else count++;
                if (req.body.end)
                    doc.setEnd(req.body.end, next);
                else count++;
            }
        });
    },
    GetPriceOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            else if (!doc)
                return res.sendBad('Booking not found');
            var price = doc.getPrice();
            if (!price)
                return res.sendBad('Could not set price for this booking', doc);
            else
                return res.sendGood('Found price', price);
        });
    },
    PayForBooking: function(req, res) {
        var app = this.app;
        app.db.bookings.findById(req.params.id, function(err, booking) {
            if (err)
                return res.sendBad(err);
            if (!booking)
                return res.sendBad('Booking not found');
            if (!req.body.token)
                return res.sendBad('Could not create a charge because no source token was provided');
            if (!booking.getPrice())
                return res.sendBad('Could not create a charge because this booking does not have a price set');
            app.stripe.charge(req.body.token, booking.getPrice(), function(err, charge) {
                if (err)
                    return res.sendBad(err);
                booking.pay(function(err) {
                    if (err)
                        return res.sendBad(err);
                    res.sendGood('Charge successful', charge);
                });
            });
        });
    }
}

module.exports = controller;