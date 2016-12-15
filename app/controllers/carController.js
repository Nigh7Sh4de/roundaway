var Errors = require('./../errors');
var Car = require('./../models/Car');

var controller = function(app) {
    this.app = app;
    app.get('/api/cars', app.checkAuth, app.checkAttendant.bind(app), this.GetAllCars.bind(this));
    app.post('/api/cars', app.checkAuth, app.bodyParser.json(), this.CreateCar.bind(this));
    app.get('/api/cars/:id', app.checkAuth, app.checkAttendant.bind(app), this.GetCar.bind(this));
    app.get('/api/cars/:id/bookings', app.checkAuth, app.checkAttendant.bind(app), this.GetAllBookingsForCar.bind(this));
    app.get('/api/cars/:id/bookings/next', app.checkAuth, app.checkAttendant.bind(app), this.GetNextBookingForCar.bind(this));
}

controller.prototype = {
    GetAllCars: function(req, res) {
        res.sendGood('Found cars', req.docs.map(function(doc) { 
            return doc.toJSON({getters: true}) 
        }));
    },
    CreateCar: function(req, res) {
        var car = new Car(req.body.car || req.body);
        if (!car.license)
            return res.sendError(new Errors.BadInput('license'));
        if (!car.user)
            car.user = req.user;
        car.save(function(err, car) {
            if (err)
                return res.sendBad(err);
            res.sendGood(car);
        })
        
    },
    GetCar: function(req, res) {
        res.sendGood('Found car', req.doc.toJSON({getters: true}));
    },
    GetAllBookingsForCar: function(req, res) {
        app.db.bookings.find({car: req.doc.id})
        .then(function(bookings) {
            bookings = bookings.map(function(b, i) {
                return b.toJSON({getters: true});
            })
            res.sendGood('Found bookings for car', bookings)
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetNextBookingForCar: function(req, res) {
        var search = {car: req.doc.id, end: {$gte: new Date() }};
        app.db.bookings.find(search)
        .sort('start')
        .limit(1)
        .then(function(bookings) {
            if (!bookings[0])
                throw new Errors.NotFound('Booking', search)
            booking = bookings[0].toJSON({getters: true});
            res.sendGood('Found next booking for car', booking)
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    }
}


module.exports = controller;