var Booking = require('./../models/Booking');
var ObjectId = require('mongoose').Types.ObjectId;

var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkAdmin, this.GetBooking.bind(this));
    // app.put('/api/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, this.GetSpotForBooking.bind(this));
    // app.put('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, this.GetStartOfBooking.bind(this));
    // app.put('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetStartOfBooking.bind(this));
    app.get('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, this.GetDurationForBooking.bind(this));
    // app.put('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetDurationForBooking.bind(this));
    app.get('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, this.GetEndOfBooking.bind(this));
    // app.put('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetEndOfBooking.bind(this));
    app.get('/api/bookings/:id/time', app.checkAuth, app.checkAdmin, this.GetTimeOfBooking.bind(this));
    // app.put('/api/bookings/:id/time', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetTimeOfBooking.bind(this));
    app.get('/api/bookings/:id/price', app.checkAuth, app.checkAdmin, this.GetPriceOfBooking.bind(this));
    app.put('/api/bookings/:id/pay', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.PayForBooking.bind(this));
    app.get('/api/bookings/:id/status', app.checkAuth, app.checkAdmin, this.GetStatusOfBooking.bind(this));
}

controller.prototype = {
    GetAllBookings: function(req, res) {
        this.app.db.bookings.find({})
        .exec()
        .then(function(docs) {
            res.sendGood('Found bookings', docs.map(function(doc) { 
                return doc.toJSON({getters: true}) 
            }));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Could not find booking';
            return res.sendGood('Found booking', booking.toJSON({getters: true}));
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    // CreateBooking: function(req, res) {
    //     if (!req.body.start) return res.sendBad('Could not create booking as no start date was specified');
    //     if (!req.body.end) return res.sendBad('Could not create booking as no end date was specified');
    //     if (req.body.end <= req.body.start) return res.sendBad('Could not create booking as the end date was before the start date');
    //     if (!req.body.spot) return res.sendBad('Could not create booking as no spot was specified');
    //     var newBooking = new Booking(req.body).toJSON();

    //     this.app.db.bookings.create(newBooking)
    //     .then(function(results) {
    //         res.sendGood('Created new bookings', results.ops || results);
    //     })
    //     .catch(function(err) {
    //         res.sendBad(err);
    //     })
        
    // },
    GetSpotForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .populate('spot')
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Could not find booking';
            var spot = booking.getSpot();
            if (!spot) throw 'This booking does not have a spot associated with it';
            res.sendGood('Found spot', spot.toJSON({getters: true}));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    // SetSpotForBooking: function(req, res) {
    //     Promise.all([
    //         this.app.db.bookings.findById(req.params.id).exec(),
    //         this.app.db.spots.findById(req.body.id).exec()
    //     ])
    //     .then(function(results) {
    //         var booking = results[0];
    //         var spot = results[1];
    //         if (!booking) throw 'Could not find booking';
    //         if (!spot) throw 'Could not find spot';
    //         return booking.setSpot(spot);
    //     })
    //     .then(function(b) {
    //         res.sendGood('Set spot for booking', b);
    //     })
    //     .catch(function(err) {
    //         res.sendBad(err);
    //     })
    // },
    GetStartOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Booking not found';
            res.sendGood('Found start datetime', booking.getStart());
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    // SetStartOfBooking: function(req, res) {
    //     this.app.db.bookings.findById(req.params.id)
    //     .exec()
    //     .then(function(booking) {
    //         if (!booking) throw 'Booking not found';
    //         return booking.setStart(req.body.start)
    //     })
    //     .then(function(booking) {
    //         res.sendGood('Set start of booking', booking);
    //     })
    //     .catch(function(err) {
    //         res.sendBad(err);
    //     });
    // },
    GetDurationForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Booking not found';
            var dur = booking.getDuration();
            if (!dur)
                throw 'This booking does not have valid start and/or end dates. Start: ' + doc.getStart() + ', End: ' + doc.getEnd();
            res.sendGood('Found duration', dur);
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    // SetDurationForBooking: function(req, res) {
    //     this.app.db.bookings.findById(req.params.id)
    //     .exec()
    //     .then(function(booking) {
    //         if (!booking) throw 'Booking not found';
    //         return booking.setDuration(req.body.duration);
    //     })
    //     .then(function(booking) {
    //         res.sendGood('Set duration of booking', booking);
    //     })
    //     .catch(function(err) {
    //         res.sendBad(err);
    //     });
    // },
    GetEndOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Booking not found';
            res.sendGood('Found end datetime', booking.getEnd());
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    // SetEndOfBooking: function(req, res) {
    //     this.app.db.bookings.findById(req.params.id)
    //     .exec()
    //     .then(function(booking) {
    //         if (!booking) throw 'Booking not found';
    //         return booking.setEnd(req.body.end);
    //     })
    //     .then(function(booking) {
    //         res.sendGood('Set end of booking', booking);
    //     })
    //     .catch(function(err) {
    //         res.sendBad(err);
    //     });
    // },
    GetTimeOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Booking not found';
            res.sendGood('Found time of booking', {
                start: booking.getStart() || 'This booking does not have a start time',
                end: booking.getEnd() || 'This booking does not have a start time',
            })
        })
        .catch(function(err) {
            res.sendBad(err);
        });;
    },
    // SetTimeOfBooking: function(req, res) {
    //     if (!req.body.start && !req.body.end)
    //         return res.sendBad('Could not set time of booking, you must specify start and/or end times');
    //     this.app.db.bookings.findById(req.params.id)
    //     .exec()
    //     .then(function(booking) {
    //         if (!booking) throw 'Booking not found';
    //         return Promise.all([
    //             booking.setStart(req.body.start),
    //             booking.setEnd(req.body.end)
    //         ])
    //     })
    //     .then(function(booking) {
    //         res.sendGood('Set time of booking', booking);
    //     })
    //     .catch(function(err) {
    //         res.sendBad(err);
    //     });
    // },
    GetPriceOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Booking not found';
            var price = booking.getPrice();
            if (!price) throw 'Could not set price for this booking';
            return res.sendGood('Found price', price);
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    PayForBooking: function(req, res) {
        if (!req.body.token)
            return res.sendBad('Could not create a charge because no source token was provided');
        var _booking;
        var _charge;
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Booking not found';
            _booking = booking;
            if (!booking.getPrice())
                throw 'Could not create a charge because this booking does not have a price set';
            return app.stripe.charge(req.body.token, booking.getPrice())
        })
        .then(function(charge) {
            _charge = charge;
            return _booking.pay()
        })
        .then(function(booking) {
            res.sendGood('Charge successful', _charge);
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    GetStatusOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id)
        .exec()
        .then(function(booking) {
            if (!booking) throw 'Booking not found';
            return res.sendGood('Found price', booking.getStatus());
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
}

module.exports = controller;