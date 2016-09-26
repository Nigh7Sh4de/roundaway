var Errors = require('./../errors');
var Car = require('./../models/Car');

var controller = function(app) {
    this.app = app;
    app.get('/api/cars', app.checkAuth, app.checkAttendant.bind(app), this.GetAllCars.bind(this));
    app.put('/api/cars', app.checkAuth, app.bodyParser.json(), this.CreateCar.bind(this));
    app.get('/api/cars/:id', app.checkAuth, app.checkAttendant.bind(app), this.GetCar.bind(this));
    app.get('/api/cars/:id/license', app.checkAuth, app.checkAttendant.bind(app), this.GetLicenseOfCar.bind(this));
    app.get('/api/cars/:id/make', app.checkAuth, app.checkAttendant.bind(app), this.GetMakeOfCar.bind(this));
    app.get('/api/cars/:id/model', app.checkAuth, app.checkAttendant.bind(app), this.GetModelOfCar.bind(this));
    app.get('/api/cars/:id/year', app.checkAuth, app.checkAttendant.bind(app), this.GetYearOfCar.bind(this));
    app.get('/api/cars/:id/colour', app.checkAuth, app.checkAttendant.bind(app), this.GetColourOfCar.bind(this));
    app.get('/api/cars/:id/description', app.checkAuth, app.checkAttendant.bind(app), this.GetDescriptionOfCar.bind(this));
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
    GetLicenseOfCar: function(req, res) {
        var license = req.doc.getLicense();
        if (!license) return res.sendBad(new Errors.MissingProperty(req.doc, 'license', license));
        res.sendGood('Found license of car', license); 
    },
    GetMakeOfCar: function(req, res) {
        var make = req.doc.getMake();
        if (!make) return res.sendBad(new Errors.MissingProperty(req.doc, 'make', make));
        res.sendGood('Found make of car', make); 
    },
    GetModelOfCar: function(req, res) {
        var model = req.doc.getModel();
        if (!model) return res.sendBad(new Errors.MissingProperty(req.doc, 'model', model));
        res.sendGood('Found model of car', model); 
    },
    GetYearOfCar: function(req, res) {
        var year = req.doc.getYear();
        if (!year) return res.sendBad(new Errors.MissingProperty(req.doc, 'year', year));
        res.sendGood('Found year of car', year); 
    },
    GetColourOfCar: function(req, res) {
        var colour = req.doc.getColour();
        if (!colour) return res.sendBad(new Errors.MissingProperty(req.doc, 'colour', colour));
        res.sendGood('Found colour of car', colour); 
    },
    GetDescriptionOfCar: function(req, res) {
        var description = req.doc.getDescription();
        if (!description) return res.sendBad(new Errors.MissingProperty(req.doc, 'description', description));
        res.sendGood('Found description of car', description); 
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