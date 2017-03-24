var Errors = require('./../errors');
var Car = require('./../models/Car');

var controller = function(app) {
    this.app = app;
    app.get('/api/cars', app.checkAuth, app.checkAttendant.bind(app), this.GetAllCars.bind(this));
    app.post('/api/cars', app.checkAuth, app.bodyParser.json(), this.CreateCar.bind(this));
    app.get('/api/cars/:id', app.checkAuth, app.checkAttendant.bind(app), this.GetCar.bind(this));
    app.patch('/api/cars/:id', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.UpdateCar.bind(this));
    app.put('/api/cars/:id/select', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.SelectCar.bind(this));
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
    UpdateCar: function(req, res) {
        var updates = [];
        if (req.body.license !== undefined) updates.push(req.doc.setLicense(req.body.license));
        if (req.body.make !== undefined) updates.push(req.doc.setMake(req.body.make));
        if (req.body.model !== undefined) updates.push(req.doc.setModel(req.body.model));
        if (req.body.year !== undefined) updates.push(req.doc.setYear(req.body.year));
        if (req.body.colour !== undefined) updates.push(req.doc.setColour(req.body.colour));
        if (req.body.description !== undefined) updates.push(req.doc.setDescription(req.body.description));

        if (!updates.length)
            res.sendBad(new Errors.BadInput('property'))
            
        Promise.all(updates)
        .then(function() {
            res.sendGood('Updated car', arguments[updates.length-1][0].toJSON({getters: true}))
        })
        .catch(function(err) {
            res.sendBad(err)
        })
    },
    SelectCar: function(req, res) {
        app.db.cars.find({user: req.user.id})
        .then(function(cars) {
            var tasks = []
            if (!req.doc.selected)
                tasks.push(req.doc.setSelected(true))
            cars.forEach(function(car) {
                if (car.id !== req.doc.id && car.selected)
                    tasks.push(car.setSelected(false))
            })
            ;(
                tasks.length ?
                Promise.all(tasks) :
                Promise.reject(new Errors.MissingProperty(req.doc, 'selected'))
            )
            .then(function(results) {
                return res.sendGood('Car updated', req.doc)
            })
            .catch(function(err) {
                res.sendBad(err)
            })


        })
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