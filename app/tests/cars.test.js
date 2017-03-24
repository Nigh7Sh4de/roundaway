var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var auth = routeTest.auth;
var mockPromise = require('./mockPromise');

var server = require('./../server');
var expressExtensions = require('./../express');
var Car = require('./../models/Car');
var Booking = require('./../models/Booking');

describe('Car schema', function() {
    before(function() {
        sinon.stub(Car.prototype, 'save', function(cb) { cb() });
    })
    after(function() {
        Car.prototype.save.restore();
    })

    describe('getSelected', function() {
        it('should get the selected of the car', function() {
            var c = new Car();
            c.selected = true;
            expect(c.getSelected()).to.be.true;
        })
    })
    describe('setSelected', function() {
        it('should set the selected of the car', function() {
            var c = new Car();
            expect(c.selected).to.not.be.ok;
            return c.setSelected(true)
            .then(function() {
                expect(c.selected).to.be.true;
            })
        })
    })
    describe('getLicense', function() {
        it('should get the license of the car', function() {
            var c = new Car();
            var license = 'some license';
            c.license = 'some license';
            expect(c.getLicense()).to.deep.equal(license);
        })
    })
    describe('setLicense', function() {
        it('should set the license of the car', function() {
            var c = new Car();
            var license = 'some license';
            expect(c.license).to.not.be.ok;
            return c.setLicense(license)
            .then(function() {
                expect(c.license).to.deep.equal(license);
            })
        })
    })
    describe('getMake', function() {
        it('should get the make of the car', function() {
            var c = new Car();
            var make = 'some make';
            c.make = 'some make';
            expect(c.getMake()).to.deep.equal(make);
        })
    })
    describe('setMake', function() {
        it('should set the make of the car', function() {
            var c = new Car();
            var make = 'some make';
            expect(c.make).to.not.be.ok;
            return c.setMake(make)
            .then(function() {
                expect(c.make).to.deep.equal(make);
            })
        })
    })
    describe('getModel', function() {
        it('should get the model of the car', function() {
            var c = new Car();
            var model = 'some model';
            c.model = 'some model';
            expect(c.getModel()).to.deep.equal(model);
        })
    })
    describe('setModel', function() {
        it('should set the model of the car', function() {
            var c = new Car();
            var model = 'some model';
            expect(c.model).to.not.be.ok;
            return c.setModel(model)
            .then(function() {
                expect(c.model).to.deep.equal(model);
            })
        })
    })
    describe('getYear', function() {
        it('should get the year of the car', function() {
            var c = new Car();
            var year = 2016;
            c.year = 2016;
            expect(c.getYear()).to.deep.equal(year);
        })
    })
    describe('setYear', function() {
        it('should set the year of the car', function() {
            var c = new Car();
            var year = 2016;
            expect(c.year).to.not.be.ok;
            return c.setYear(year)
            .then(function() {
                expect(c.year).to.deep.equal(year);
            })
        })
    })
    describe('getColour', function() {
        it('should get the colour of the car', function() {
            var c = new Car();
            var colour = 'some colour';
            c.colour = 'some colour';
            expect(c.getColour()).to.deep.equal(colour);
        })
    })
    describe('setColour', function() {
        it('should set the colour of the car', function() {
            var c = new Car();
            var colour = 'some colour';
            expect(c.colour).to.not.be.ok;
            return c.setColour(colour)
            .then(function() {
                expect(c.colour).to.deep.equal(colour);
            })
        })
    })
    describe('getDescription', function() {
        it('should get the description of the car', function() {
            var c = new Car();
            var description = 'some description';
            c.description = 'some description';
            expect(c.getDescription()).to.deep.equal(description);
        })
    })
    describe('setDescription', function() {
        it('should set the description of the car', function() {
            var c = new Car();
            var description = 'some description';
            expect(c.description).to.not.be.ok;
            return c.setDescription(description)
            .then(function() {
                expect(c.description).to.deep.equal(description);
            })
        })
    })
})

routeTest('carController', [
    {
        verb: verbs.GET,
        route: '/api/cars',
        method: 'GetAllCars',
        auth: auth.ATTENDANT
    },
    {
        verb: verbs.POST,
        route: '/api/cars',
        method: 'CreateCar',
        auth: auth.AUTHORIZED
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id',
        method: 'GetCar',
        auth: auth.ATTENDANT
    },
    {
        verb: verbs.PATCH,
        route: '/api/cars/:id',
        method: 'UpdateCar',
        auth: auth.OWNER
    },
    {
        verb: verbs.PUT,
        route: '/api/cars/:id/select',
        method: 'SelectCar',
        auth: auth.OWNER
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/bookings',
        method: 'GetAllBookingsForCar',
        auth: auth.ATTENDANT
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/bookings/next',
        method: 'GetNextBookingForCar',
        auth: auth.ATTENDANT
    }
])

describe('carController', function() {
    var app,
        req = {},
        res = {};
    
    beforeEach(function() {
        var inject = server.GetDefaultInjection();
        app = server(inject);
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })
    
    describe('GetAllCars', function() {
        it('should GetAllCars', function(done) {
            var c = new Car();
            req.docs = [c];
            req.params.id = c.id;
            app.db.cars = {
                find: mockPromise([c])
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith([c.toJSON({getters: true})]), JSON.stringify(res.send.firstCall.args[0])).to.be.true;
                done();
            }
            app.carController.GetAllCars(req, res);
        })  

        it('should get cars with license', function(done) {
            var license = '1z2x3c';
            var c = new Car({
                license: license
            });
            req.docs = [c];
            req.params.id = c.id;
            req.query.license = license;
            app.db.cars = {
                find: function(search) {
                    expect(search.license).to.deep.equal(license);
                    return mockPromise([c])();
                }
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.toJSON({getters: true})));
                done();
            }
            app.carController.GetAllCars(req, res);
        })  
    })
    describe('CreateCar', function() {
        it('should CreateCar', function(done) {
            sinon.stub(Car.prototype, 'save', function(cb) { cb(); });
            var license = '1z2x3c';
            req.body = {
                license: license
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(Car.prototype.save.calledOnce).to.be.true;
                Car.prototype.save.restore();
                done();
            }
            app.carController.CreateCar(req, res);
        })    
    })
    describe('GetCar', function() {
        it('should GetCar', function(done) {
            var c = new Car();
            req.doc = c;
            req.params.id = c.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.toJSON({getters: true})));
                done();
            }
            app.carController.GetCar(req, res);
        })    
    })
    describe('UpdateCar', function() {
        it('should be able to update license', function(done) {
            var car = new Car();
            var license = 'some license';
            req.body.license = license;
            req.doc = car;
            req.params.id = car.id;
            sinon.stub(car, 'setLicense', function(license) {
                this.license = license;
                return mockPromise(this)()
            })
            res.sendBad = done;
            res.sent = function() {
                expect(car.setLicense.calledOnce).to.be.true;
                car.license = license;
                expect(res.sentWith(car.toJSON({getters: true}))).to.be.true;
                done();
            }
            app.carController.UpdateCar(req, res);
        })

        it('should be able to update make', function(done) {
            var car = new Car();
            var make = 'some make';
            req.body.make = make;
            req.doc = car;
            req.params.id = car.id;
            sinon.stub(car, 'setMake', function(make) {
                this.make = make;
                return mockPromise(this)()
            })
            res.sendBad = done;
            res.sent = function() {
                expect(car.setMake.calledOnce).to.be.true;
                car.make = make;
                expect(res.sentWith(car.toJSON({getters: true}))).to.be.true;
                done();
            }
            app.carController.UpdateCar(req, res);
        })

        it('should be able to update model', function(done) {
            var car = new Car();
            var model = 'some model';
            req.body.model = model;
            req.doc = car;
            req.params.id = car.id;
            sinon.stub(car, 'setModel', function(model) {
                this.model = model;
                return mockPromise(this)()
            })
            res.sendBad = done;
            res.sent = function() {
                expect(car.setModel.calledOnce).to.be.true;
                car.model = model;
                expect(res.sentWith(car.toJSON({getters: true}))).to.be.true;
                done();
            }
            app.carController.UpdateCar(req, res);
        })

        it('should be able to update year', function(done) {
            var car = new Car();
            var year = 2017;
            req.body.year = year;
            req.doc = car;
            req.params.id = car.id;
            sinon.stub(car, 'setYear', function(year) {
                this.year = year;
                return mockPromise(this)()
            })
            res.sendBad = done;
            res.sent = function() {
                expect(car.setYear.calledOnce).to.be.true;
                car.year = year;
                expect(res.sentWith(car.toJSON({getters: true}))).to.be.true;
                done();
            }
            app.carController.UpdateCar(req, res);
        })

        it('should be able to update colour', function(done) {
            var car = new Car();
            var colour = 'some colour';
            req.body.colour = colour;
            req.doc = car;
            req.params.id = car.id;
            sinon.stub(car, 'setColour', function(colour) {
                this.colour = colour;
                return mockPromise(this)()
            })
            res.sendBad = done;
            res.sent = function() {
                expect(car.setColour.calledOnce).to.be.true;
                car.colour = colour;
                expect(res.sentWith(car.toJSON({getters: true}))).to.be.true;
                done();
            }
            app.carController.UpdateCar(req, res);
        })

        it('should be able to update description', function(done) {
            var car = new Car();
            var description = 'some description';
            req.body.description = description;
            req.doc = car;
            req.params.id = car.id;
            sinon.stub(car, 'setDescription', function(description) {
                this.description = description;
                return mockPromise(this)()
            })
            res.sendBad = done;
            res.sent = function() {
                expect(car.setDescription.calledOnce).to.be.true;
                car.description = description;
                expect(res.sentWith(car.toJSON({getters: true}))).to.be.true;
                done();
            }
            app.carController.UpdateCar(req, res);
        })
    })
    describe('SelectCar', function() {
        it('selects the car', function(done) {
            var car = new Car()
            sinon.stub(car, 'setSelected', mockPromise(car))
            app.db.cars = {
                find: mockPromise([car])
            }
            req.user = {
                id: '123abc'
            }
            req.doc = car
            res.sendBad = done
            res.sent = function() {
                expect(car.setSelected.calledOnce).to.be.true;
                done()
            }
            app.carController.SelectCar(req, res)
        })

        it('deselects existing cars', function(done) {
            var car = new Car(),
                car2 = new Car({
                    selected: true
                })
            sinon.stub(car, 'setSelected', mockPromise(car))
            sinon.stub(car2, 'setSelected', mockPromise(car2))
            app.db.cars = {
                find: mockPromise([car, car2])
            }
            req.user = {
                id: '123abc'
            }
            req.doc = car
            res.sendBad = done
            res.sent = function() {
                expect(car2.setSelected.calledOnce).to.be.true;
                expect(car2.setSelected.calledWith(false)).to.be.true;
                done();
            }
            app.carController.SelectCar(req, res)
        })
    })
    describe('GetAllBookingsForCar', function() {
        it('should get all bookings for car', function(done) {
            var c = new Car();
            var b = new Booking({
                car: c.id
            })
            req.doc = c;
            app.db.bookings = {
                find: mockPromise([b])
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith([b.toJSON({getters: true})]));
                done();
            }
            app.carController.GetAllBookingsForCar(req, res);
        })
    })
    describe('GetNextBookingForCar', function() {
        it('should get next booking for car', function(done) {
            var c = new Car();
            var b = new Booking({
                car: c.id
            })
            req.doc = c;
            app.db.bookings = {
                find: mockPromise([b])
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(b.toJSON({getters: true})));
                done();
            }
            app.carController.GetNextBookingForCar(req, res);
        })
    })

})