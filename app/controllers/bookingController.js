var Booking = require('./../models/Booking');
var Errors = require('./../errors');
var ObjectId = require('mongoose').Types.ObjectId;

var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkOwner.bind(app), this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkOwner.bind(app), this.GetBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkOwner.bind(app), this.GetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/car', app.checkAuth, app.checkOwner.bind(app), this.GetCarForBooking.bind(this));
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
    PayForBooking: function(req, res) {
        if (!req.body.token)
            return res.sendBad(new Errors.BadInput('token', 'create a charge'));

        var _charge;
        if (!req.doc.getPrice())
            return res.sendBad(new Errors.MissingProperty(req.doc, 'price', req.doc.getPrice()));
        
        var destination = null;
        app.db.spots.findById(req.doc.spot._id || req.doc.spot)
        .then(function(spot) {
            return app.db.users.findById(spot.user._id || spot.user)
        })
        .then(function(user) {
            if (user.stripe && user.stripe.stripe_id)
                destination = user.stripe.stripe_id;
            if (!req.body.useStripeCustomer)
                return Promise.resolve({id: req.body.token});
            else if (req.user.stripe && req.user.stripe.customer_id)
                return Promise.resolve({id: req.user.stripe.customer_id});
            else return app.stripe.createCustomer(req.body.token)
        })
        .then(function(customer) {
            return app.stripe.charge(customer.id, destination, req.doc.getPrice())
        })
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
    }
}

module.exports = controller;