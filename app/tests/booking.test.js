var expect = require('chai').expect;
var sinon = require('sinon');
var Errors = require('./../errors');
var expressExtensions = require('./../express');
var mockPromise = require('./mockPromise');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var auth = routeTest.auth;
var server = require('./../server');
var Booking = require('./../models/Booking');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');
var Car = require('./../models/Car');
var User = require('./../models/User');

describe('Booking schema', function() {
    before(function() {
        sinon.stub(Booking.prototype, 'save', function(cb) { cb() });
    })
    
    after(function() {
        Booking.prototype.save.restore();
    })
    
    describe('sets default values correctly', function() {
        var b = new Booking();
        expect(b.status).to.equal('unpaid');
    })
    
    describe('archive', function() {
        it('should set status to archived', function() {
            var b = new Booking();
            expect(b.status).to.not.equal(Booking.status.archived);
            return b.archive().then(function() {
                expect(b.status).to.equal(Booking.status.archived);
            })
        })
    })

    describe('pay', function() {
        it('should set status to paid', function() {
            var b = new Booking();
            expect(b.status).to.not.equal(Booking.status.paid);
            return b.pay().then(function() {
                expect(b.status).to.equal(Booking.status.paid);
            })
        })
    })

    describe('getPrice', function() {
        it('should return the price', function() {
            var b = new Booking();
            var price = 123.45;
            b.price = price;
            expect(b.getPrice()).to.equal(price);
        })
    })
    
    describe('getSpot', function() {
        it('should return spot id', function() {
            var b = new Booking();
            var spot = new Spot();
            b.spot = spot._id;
            expect(b.getSpot(), b.getSpot()).to.equal(spot._id);
        })
        
        it('should error if no spot id', function() {
            var b = new Booking();
            var result = b.getSpot();
            expect(result).to.be.null;
        })
    })
    
    describe('setSpot', function() {
        it('should set the lot for generic spots', function() {
            var b = new Booking();
            var l = new Lot();
            var s = new Spot({lot: l.id, reserved: false});
            s.price.perHour = 123.45;
            expect(b.spot).to.not.be.ok;
            return b.setSpot(s).then(function() {
                expect(b.spot).to.deep.equal(s._id);
                expect(b.lot).to.deep.equal(l._id);
            })
        })

        it('should set the price', function() {
            var b = new Booking();
            var price = 123.45;
            var durationInHours = 2;
            b.start = new Date('2016/01/01 0:00');
            b.end = new Date('2016/01/01 2:00');
            var s = new Spot();
            s.price.perHour = price;
            expect(b.spot).to.not.be.ok;
            expect(b.price).to.not.be.ok;
            return b.setSpot(s).then(function(spot) {
                expect(b.price).to.equal(price * durationInHours);
            })
        })

        it('should accept spot objects', function() {
            var b = new Booking();
            var s = new Spot();
            s.price.perHour = 123.45;
            expect(b.spot).to.not.be.ok;
            return b.setSpot(s).then(function() {
                expect(b.spot).to.deep.equal(s._id);
            })
        })
        
        it('should error if invalid spot', function(done) {
            var b = new Booking();
            var tests = 0;
            [
                undefined,
                123,
                true,
                '',
                {},
                {someBadProp: 'some unimportant value'}
            ].forEach(function (input, i, arr) {
                b.setSpot(input)
                .then(function() {
                    done(input || 'empty');
                })
                .catch(function(err) {
                    expect(b.spot).to.not.be.ok;
                    if (++tests >= arr.length)
                        done();
                })
            })
        })
    })
    
    describe('getStart', function() {
        it('should return start time', function() {
            var b = new Booking();
            var start = new Date();
            b.start = start;
            expect(b.getStart()).to.equal(start);
        })
        
        it('should return null if no start time set', function() {
            var b = new Booking();
            var result = b.getStart();
            expect(result).to.not.be.ok;
        })
    })
    
    describe('setStart', function() {
        it('should set start time', function() {
            var b = new Booking();
            var start = new Date();
            expect(b.start).to.not.be.ok;
            return b.setStart(start).then(function(spot) {
                expect(b.start).to.deep.equal(start);
            })
        })
        
        it('should parse strings into date objects', function() {
            var b = new Booking();
            var str = '01/01/2000';
            var start = new Date(str);
            expect(b.start).to.not.be.ok;
            return b.setStart(str).then(function(spot) {
                expect(b.start).to.deep.equal(start);
            })
        })
        
        it('should error if invalid start time', function(done) {
            var b = new Booking();
            var tests = 0;
            [
                null,
                undefined,
                true,
                ''
            ].forEach(function (input, i, arr) {
                b.setStart(input)
                .then(function() {
                    done(input || 'empty')
                })
                .catch(function(err) {
                    expect(b.start).to.not.be.ok;
                    if (++tests >= arr.length)
                        done();
                })
            })
        })
    })
    
    describe('getDuration', function() {
        it('should return duration', function() {
            var b = new Booking();
            b.start = new Date('01/01/2000');
            b.end = new Date();
            var duration = b.end - b.start;
            expect(b.getDuration()).to.equal(duration);
        })
        
        it('should error if no start time set', function() {
            var b = new Booking();
            b.end = new Date();
            var result = b.getDuration();
            expect(result).to.be.null;
        })
        
        it('should error if no duration set', function() {
            var b = new Booking();
            b.start = new Date();
            var result = b.getDuration();
            expect(result).to.be.null;
        })
    })
    
    describe('setDuration', function() {
        it('should error if no start time set', function() {
            var b = new Booking();
            var end = b.end = new Date();
            var dur = 123; 
            return b.setDuration(dur).then(function() {
                expect.fail();
            }).catch(function(e) {
                expect(e).to.be.ok;
            })
        })
        
        it('should set start', function() {
            var b = new Booking();
            b.start = new Date('01/01/2000');
            var end = new Date();
            var dur = end - b.start;
            expect(b.end).to.not.be.ok; 

            return b.setDuration(dur).then(function() {
                expect(b.end).to.deep.equal(end);
            });
        })
        
        it('should parse string values', function() {
            var b = new Booking();
            b.start = new Date('01/01/2000');
            var end = new Date();
            var dur = end - b.start;
            expect(b.end).to.not.be.ok; 

            return b.setDuration(dur.toString()).then(function() {
                expect(b.end).to.deep.equal(end);
            });
        })
        
        it('should error if invalid duration', function(done) {
            var b = new Booking();
            var start = b.start = new Date('2016/01/01');
            var end = b.end = new Date();
            var tests = 0;
            [
                null,
                undefined,
                -1,
                true,
                ''
            ].forEach(function (input, i, arr) {
                b.setDuration(input)
                .then(function() {
                    done(input || 'empty');
                })
                .catch(function(err) {
                    expect(err).to.be.ok;
                    expect(b.start).to.deep.equal(start);
                    expect(b.end).to.deep.equal(end);
                    if (++tests >= arr.length)
                        done();
                })
            });
        })
    })
    
    describe('getEnd', function() {
        it('should return end time', function() {
            var b = new Booking();
            var end = new Date();
            b.end = end;
            expect(b.getEnd()).to.deep.equal(end);
        })
        
        it('should error if no end time set', function() {
            var b = new Booking();
            var result = b.getEnd();
            expect(result).to.not.be.ok;
        })
    })
    
    describe('setEnd', function() {
        it('should set end time', function() {
            var b = new Booking();
            var end = new Date();
            return b.setEnd(end).then(function() {
                expect(b.end).to.deep.equal(end);
            })
        })
        
        it('should parse strings into date objects', function() {
            var b = new Booking();
            var str = '2016/01/01'
            var end = new Date(str);
            return b.setEnd(str).then(function() {
                expect(b.end).to.deep.equal(end);
            })
        })
        
        it('should error if invalid end time', function(done) {
            var b = new Booking();
            var tests = 0;
            [
                null,
                undefined,
                true,
                ''
            ].forEach(function (input, i, arr) {
                b.setEnd(input)
                .then(function() {
                    done(input || 'empty')
                })
                .catch(function(err) {
                    expect(err).to.be.ok;
                    expect(b.end).to.not.be.ok;
                    if (++tests >= arr.length)
                        done();
                })
            });
        })
    })
})

routeTest('bookingController', [
    {
        verb: verbs.GET,
        route: '/api/bookings',
        method: 'GetAllBookings',
        auth: auth.OWNER
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id',
        method: 'GetBooking',
        auth: auth.OWNER
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/spot',
        method: 'GetSpotForBooking',
        auth: auth.OWNER
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/car',
        method: 'GetCarForBooking',
        auth: auth.OWNER
    },
    {
        verb: verbs.PUT,
        route: '/api/bookings/:id/pay',
        method: 'PayForBooking',
        auth: auth.OWNER
    }
])

describe('bookingController', function() {
    var app,
        inject;
    
    var req = {},
        res = {};
    
    beforeEach(function() {
        inject = server.GetDefaultInjection();
        app = server(inject);
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })
        
    describe('GetAllBookings', function() {
        it('should return all bookings', function(done) {
            var bookings = [new Booking(), new Booking()];
            var simpleBookings = bookings.map(function(b) {
                return b.toJSON({getters: true});
            });
            req.docs = bookings;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(simpleBookings)).to.be.true;
                done();
            }
            app.bookingController.GetAllBookings(req, res);
        })
    })
    
    describe('GetBooking', function() {
        it('should get booking with specified id', function(done) {
            var booking = new Booking();
            req.doc = booking;
            var simpleBooking = booking.toJSON({getters: true});
            req.params.id = booking.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(simpleBooking)).to.be.true;
                done();
            }
            app.bookingController.GetBooking(req, res);
        })
    })
            
    describe('GetSpotForBooking', function() {
        it('should return error if booking has no spot attached', function(done) {
            req.doc = new Booking();
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })

        it('should return the spot associated with the booking', function(done) {
            var spot = new Spot();
            var booking = new Booking();
            booking.spot = spot;
            req.doc = booking;
            app.db.spots = {
                findById: mockPromise(spot)
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(spot.toJSON({getters: true}))).to.be.true;
                done();
            };
            app.bookingController.GetSpotForBooking(req, res);
        })
        
        it('should error if db encountered error looking for spot', function(done) {
            req.doc = new Booking();
            app.db.spots = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })
        
        it('should return error if spot found is null', function(done) {
            req.doc = new Booking({
                spot: '123456789012345678901234'
            });
            app.db.spots = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.NotFound)).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })
    })
            
    describe('GetCarForBooking', function() {
        it('should return error if booking has no car attached', function(done) {
            req.doc = new Booking();
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.bookingController.GetCarForBooking(req, res);
        })

        it('should return the car associated with the booking', function(done) {
            var car = new Car();
            var booking = new Booking();
            booking.car = car;
            req.doc = booking;
            app.db.cars = {
                findById: mockPromise(car)
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(car.toJSON({getters: true}))).to.be.true;
                done();
            };
            app.bookingController.GetCarForBooking(req, res);
        })
        
        it('should error if db encountered error looking for car', function(done) {
            req.doc = new Booking();
            app.db.cars = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.bookingController.GetCarForBooking(req, res);
        })
        
        it('should return error if car found is null', function(done) {
            req.doc = new Booking({
                car: '123456789012345678901234'
            });
            app.db.cars = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.NotFound)).to.be.true;
                done();
            }
            app.bookingController.GetCarForBooking(req, res);
        })
    })
    
    describe('PayForBooking', function() {
        var stripeResponse,
            charge;

        beforeEach(function() {
            stripeResponse = {someProp: 'some value'};
            inject.stripe = function(){
                this.charge = charge = sinon.spy(function(t,a) {
                    return Promise.resolve(charge);
                })
            }
            app = server(inject);
        })

        it('should create a new customer entity if needed', function(done) {
            var u = new User({
                stripe: {}
            });
            var b = new Booking({user: u});
            var s = b.spot = new Spot({user: u});
            b.price = 123.45;
            b.pay = sinon.spy(function() {
                return Promise.resolve();
            });
            app.db.spots = {
                findById: mockPromise(s)
            }
            app.db.users = {
                findById: mockPromise(u)
            }
            app.stripe.createCustomer = sinon.spy(mockPromise({id: 'cus_ some id'}));
            req.user = {};
            req.doc = b;
            req.params.id = b.id;
            req.body.token = 'sometoken';
            req.body.useStripeCustomer = true;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(app.stripe.createCustomer.calledOnce).to.be.true;
                expect(charge.calledOnce).to.be.true;
                expect(b.pay.calledOnce).to.be.true;
                done();
            }
            app.bookingController.PayForBooking(req, res);
        })

        it('should mark booking as paid if charge is successful', function(done) {
            var u = new User({
                stripe: {
                    cus: 'cus_ some id'
                }
            });
            var b = new Booking({user: u});
            var s = b.spot = new Spot({user: u});
            b.price = 123.45;
            b.pay = sinon.spy(function() {
                return Promise.resolve();
            });
            app.db.spots = {
                findById: mockPromise(s)
            }
            app.db.users = {
                findById: mockPromise(u)
            }
            req.user = {};
            req.doc = b;
            req.params.id = b.id;
            req.body.token = 'sometoken';
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(charge.calledOnce).to.be.true;
                expect(b.pay.calledOnce).to.be.true;
                done();
            }
            app.bookingController.PayForBooking(req, res);
        })

        it('should attempt to make a charge', function(done) {
            var u = new User({
                stripe: {
                    cus: 'cus_ some id'
                }
            });
            var b = new Booking({user: u});
            var s = b.spot = new Spot({user: u});
            b.price = 123.45;
            b.pay = function() { return Promise.resolve() };
            app.db.spots = {
                findById: mockPromise(s)
            }
            app.db.users = {
                findById: mockPromise(u)
            }
            req.user = {};
            req.doc = b;
            req.params.id = b.id;
            req.body.token = 'sometoken';
            res.sendBad = done;
            res.sent = function() {
                expect(charge.calledOnce).to.be.true;
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.bookingController.PayForBooking(req, res);
            
        })

        it('should fail if booking does not have a price set', function(done) {
            var u = new User({
                stripe: {
                    cus: 'cus_ some id'
                }
            });
            var b = new Booking({user: u});
            var s = b.spot = new Spot({user: u});
            app.db.spots = {
                findById: mockPromise(s)
            }
            app.db.users = {
                findById: mockPromise(u)
            }
            req.user = {};
            req.doc = b;
            req.params.id = b.id;
            req.body.token = 'sometoken';
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                expect(charge.callCount).to.equal(0);
                done();
            }
            app.bookingController.PayForBooking(req, res);
        })

        it('should fail if not passed proper token', function(done) {
            var u = new User({
                stripe: {
                    cus: 'cus_ some id'
                }
            });
            var b = new Booking({user: u});
            var s = b.spot = new Spot({user: u});
            b.price = 123.45;
            app.db.spots = {
                findById: mockPromise(s)
            }
            app.db.users = {
                findById: mockPromise(u)
            }
            req.user = {};
            req.doc = b;
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.BadInput)).to.be.true;
                expect(charge.callCount).to.equal(0);
                done();
            }
            app.bookingController.PayForBooking(req, res);
        })
    })
})