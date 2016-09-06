var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;

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
        ignoreOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id',
        method: 'GetCar'
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/license',
        method: 'GetLicenseOfCar'
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/make',
        method: 'GetMakeOfCar'
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/model',
        method: 'GetModelOfCar'
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/year',
        method: 'GetYearOfCar'
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/colour',
        method: 'GetColourOfCar'
    },
    {
        verb: verbs.GET,
        route: '/api/cars/:id/description',
        method: 'GetDescriptionOfCar'
    }
])

describe('carController', function() {
    
})