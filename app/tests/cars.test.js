var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var mockPromise = require('./mockPromise');

var server = require('./../../server');
var expressExtensions = require('./../express');
var Car = require('./../models/Car');

describe('Car schema', function() {
    before(function() {
        sinon.stub(Car.prototype, 'save', function(cb) { cb() });
    })

    after(function() {
        Car.prototype.save.restore();
    })

    describe('getLicense', function() {
        it('should get the license of the car', function() {
            var c = new Car();
            var license = 'some license';
            c.license = 'some license';
            expect(c.getLicense()).to.deep.equal(license);
        })
    })

    describe('setLicense', function(license) {
        var c = new Car();
        var license = 'some license';
        expect(c.license).to.not.be.ok;
        return c.setLicense(license)
        .then(function() {
            expect(c.license).to.deep.equal(license);
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

    describe('setMake', function(make) {
        var c = new Car();
        var make = 'some make';
        expect(c.make).to.not.be.ok;
        return c.setMake(make)
        .then(function() {
            expect(c.make).to.deep.equal(make);
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

    describe('setModel', function(model) {
        var c = new Car();
        var model = 'some model';
        expect(c.model).to.not.be.ok;
        return c.setModel(model)
        .then(function() {
            expect(c.model).to.deep.equal(model);
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

    describe('setYear', function(year) {
        var c = new Car();
        var year = 2016;
        expect(c.year).to.not.be.ok;
        return c.setYear(year)
        .then(function() {
            expect(c.year).to.deep.equal(year);
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

    describe('setColour', function(colour) {
        var c = new Car();
        var colour = 'some colour';
        expect(c.colour).to.not.be.ok;
        return c.setColour(colour)
        .then(function() {
            expect(c.colour).to.deep.equal(colour);
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

    describe('setDescription', function(description) {
        var c = new Car();
        var description = 'some description';
        expect(c.description).to.not.be.ok;
        return c.setDescription(description)
        .then(function() {
            expect(c.description).to.deep.equal(description);
        })
    })
})

routeTest('carController', [
    {
        verb: verbs.GET,
        route: '/api/cars',
        method: 'GetAllCars',
        ignoreId: true,
        attendantOrOwner: true
    },
    {
        verb: verbs.PUT,
        route: '/api/cars',
        method: 'CreateCar',
        ignoreAdmin: true,
        ignoreId: true,
        ignoreOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id',
        method: 'GetCar',
        attendantOrOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/license',
        method: 'GetLicenseOfCar',
        attendantOrOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/make',
        method: 'GetMakeOfCar',
        attendantOrOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/model',
        method: 'GetModelOfCar',
        attendantOrOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/year',
        method: 'GetYearOfCar',
        attendantOrOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/colour',
        method: 'GetColourOfCar',
        attendantOrOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/description',
        method: 'GetDescriptionOfCar',
        attendantOrOwner: true
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
            req.doc = c;
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

    describe('GetLicenseOfCar', function() {
        it('should GetLicenseOfCar', function(done) {
            var c = new Car();
            c.license = 'some license';
            req.doc = c;
            req.params.id = c.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.license)).to.be.true;
                done();
            }
            app.carController.GetLicenseOfCar(req, res);
        })    
    })

    describe('GetMakeOfCar', function() {
        it('should GetMakeOfCar', function(done) {
            var c = new Car();
            c.make = 'some make';
            req.doc = c;
            req.params.id = c.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.make)).to.be.true;
                done();
            }
            app.carController.GetMakeOfCar(req, res);
        })    
    })

    describe('GetModelOfCar', function() {
        it('should GetModelOfCar', function(done) {
            var c = new Car();
            c.model = 'some model';
            req.doc = c;
            req.params.id = c.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.model)).to.be.true;
                done();
            }
            app.carController.GetModelOfCar(req, res);
        })    
    })

    describe('GetYearOfCar', function() {
        it('should GetYearOfCar', function(done) {
            var c = new Car();
            c.year = 2016;
            req.doc = c;
            req.params.id = c.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.year)).to.be.true;
                done();
            }
            app.carController.GetYearOfCar(req, res);
        })    
    })

    describe('GetColourOfCar', function() {
        it('should GetColourOfCar', function(done) {
            var c = new Car();
            c.colour = 'some colour';
            req.doc = c;
            req.params.id = c.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.colour)).to.be.true;
                done();
            }
            app.carController.GetColourOfCar(req, res);
        })    
    })

    describe('GetDescriptionOfCar', function() {
        it('should GetDescriptionOfCar', function(done) {
            var c = new Car();
            c.description = 'some description';
            req.doc = c;
            req.params.id = c.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(c.description)).to.be.true;
                done();
            }
            app.carController.GetDescriptionOfCar(req, res);
        })    
    })


})