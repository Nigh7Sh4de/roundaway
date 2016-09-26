var Booking = require('./../models/Booking');
var Errors = require('./../errors');
var ObjectId = require('mongoose').Types.ObjectId;

var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkOwner.bind(app), this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkOwner.bind(app), this.GetBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkOwner.bind(app), this.GetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/car', app.checkAuth, app.checkOwner.bind(app), this.GetCarForBooking.bind(this));
    app.get('/api/bookings/:id/start', app.checkAuth, app.checkOwner.bind(app), this.GetStartOfBooking.bind(this));
    app.get('/api/bookings/:id/duration', app.checkAuth, app.checkOwner.bind(app), this.GetDurationForBooking.bind(this));
    app.get('/api/bookings/:id/end', app.checkAuth, app.checkOwner.bind(app), this.GetEndOfBooking.bind(this));
    app.get('/api/bookings/:id/time', app.checkAuth, app.checkOwner.bind(app), this.GetTimeOfBooking.bind(this));
    app.get('/api/bookings/:id/price', app.checkAuth, app.checkOwner.bind(app), this.GetPriceOfBooking.bind(this));
    app.get('/api/bookings/:id/status', app.checkAuth, app.checkOwner.bind(app), this.GetStatusOfBooking.bind(this));
    app.put('/api/bookings/:id/pay', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.PayForBooking.bind(this));
}

controller.prototype = {
    GetAllBookings: function(req, res) {
        res.sendGood('Found bookings', req.docs.map(function(doc) { 
            return doc.toJSON({getters: true}) 
        }));
    },
    GetBooking: function(req, res) {
        res.sendGood('Found booking', req.doc.toJSON({getters: true}));
    },
    GetSpotForBooking: function(req, res) {
        if (!req.doc.spot)
            return res.sendBad(new Errors.MissingProperty(req.doc, 'spot'));
        this.app.db.spots.findById(req.doc.spot)
        .exec()
        .then(function(spot) {
            if (!spot) throw new Errors.NotFound('Spot', req.doc.spot);
            res.sendGood('Found spot', spot.toJSON({getters: true}));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetCarForBooking: function(req, res) {
        if (!req.doc.car)
            return res.sendBad(new Errors.MissingProperty(req.doc, 'car'));
        this.app.db.cars.findById(req.doc.car)
        .exec()
        .then(function(car) {
            if (!car) throw new Errors.NotFound('Car', req.doc.car);
            res.sendGood('Found car', car.toJSON({getters: true}));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetStartOfBooking: function(req, res) {
        res.sendGood('Found start datetime', req.doc.getStart());
    },
    GetDurationForBooking: function(req, res) {
        var dur = req.doc.getDuration();
        if (!dur)
            return res.sendBad(new Errors.MissingProperty(req.doc, 'start and/or end dates set', {start: req.doc.getStart(), end: req.doc.getEnd()}));
        res.sendGood('Found duration', dur);
    },
    GetEndOfBooking: function(req, res) {
        res.sendGood('Found end datetime', req.doc.getEnd());
    },
    GetTimeOfBooking: function(req, res) {
        res.sendGood('Found time of booking', {
            start: req.doc.getStart() || 'This booking does not have a start time',
            end: req.doc.getEnd() || 'This booking does not have a start time',
        })
    },
    GetPriceOfBooking: function(req, res) {
        res.sendGood('Found price', req.doc.getPrice());
    },
    PayForBooking: function(req, res) {
        if (!req.body.token)
            return res.sendBad(new Errors.BadInput('token', 'create a charge'));

        var _charge;
        if (!req.doc.getPrice())
            return res.sendBad(new Errors.MissingProperty(req.doc, 'price', req.doc.getPrice()));
        
        app.stripe.charge(req.body.token, req.doc.getPrice())
        .then(function(charge) {
            _charge = charge;
            return req.doc.pay()
        })
        .then(function(booking) {
            res.sendGood('Charge successful', _charge);
        })
        .catch(function(err) {
            res.sendBad(err);
        });
    },
    GetStatusOfBooking: function(req, res) {
        res.sendGood('Found status', req.doc.getStatus());
    },
}

module.exports = controller;