var Booking = require('./../models/Booking');
var Errors = require('./../errors');
var ObjectId = require('mongoose').Types.ObjectId;

var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkOwner, this.GetBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkOwner, this.GetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/start', app.checkAuth, app.checkOwner, this.GetStartOfBooking.bind(this));
    app.get('/api/bookings/:id/duration', app.checkAuth, app.checkOwner, this.GetDurationForBooking.bind(this));
    app.get('/api/bookings/:id/end', app.checkAuth, app.checkOwner, this.GetEndOfBooking.bind(this));
    app.get('/api/bookings/:id/time', app.checkAuth, app.checkOwner, this.GetTimeOfBooking.bind(this));
    app.get('/api/bookings/:id/price', app.checkAuth, app.checkOwner, this.GetPriceOfBooking.bind(this));
    app.get('/api/bookings/:id/status', app.checkAuth, app.checkOwner, this.GetStatusOfBooking.bind(this));
    app.put('/api/bookings/:id/pay', app.checkAuth, app.checkOwner, app.bodyParser.json(), this.PayForBooking.bind(this));
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
        res.sendGood('Found booking', req.doc.toJSON({getters: true}));
    },
    GetSpotForBooking: function(req, res) {
        if (!req.doc.spot)
            return res.sendBad(new Errors.MissingProperty(req.doc, 'spot'));
        this.app.db.spots.findById(req.doc.spot)
        .exec()
        .then(function(spot) {
            if (!spot) throw 'Could not find associated spot';
            res.sendGood('Found spot', spot.toJSON({getters: true}));
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
            return res.sendBad('Could not create a charge because no source token was provided');

        var _charge;
        if (!req.doc.getPrice())
            return res.sendBad('Could not create a charge because this booking does not have a price set');
        
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