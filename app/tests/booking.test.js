var expect = require('chai').expect;
var sinon = require('sinon');
var expressExtensions = require('./../express');
var mockPromise = require('./mockPromise');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var server = require('./../../server');
var Booking = require('./../models/Booking');
var Spot = require('./../models/Spot');

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
        
        it('should error if invalid spot', function() {
            var b = new Booking();
            return Promise.all([
                {id:'123', getPrice: function() {
                    return {perHour: 123}
                }},
                undefined,
                123,
                true,
                '',
                {},
                {someBadProp: 'some unimportant value'}
            ].map(function (input) {
                return b.setSpot(input);
            }))
            .catch(function(err) {
                expect(b.spot).to.not.be.ok;
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
        
        it('should error if invalid start time', function() {
            var b = new Booking();
            return Promise.all([
                null,
                undefined,
                true,
                ''
            ].map(function (input) {
                return b.setStart(input);
            }))
            .catch(function(err) {
                expect(b.start).to.not.be.ok;
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
        
        it('should error if invalid duration', function() {
            var b = new Booking();
            var start = b.start = new Date('2016/01/01');
            var end = b.end = new Date();
            return Promise.all([
                null,
                undefined,
                -1,
                true,
                ''
            ].map(function (input) {
                return b.setDuration(input);
            }))
            .then(function() {
                expect.fail();
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(b.start).to.deep.equal(start);
                expect(b.end).to.deep.equal(end);
            })
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
        
        it('should error if invalid end time', function() {
            var b = new Booking();
            return Promise.all([
                null,
                undefined,
                true,
                ''
            ].map(function (input) {
                return b.setEnd(input);
            }))
            .then(function() {
                expect.fail();
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(b.end).to.not.be.ok;
            })
        })
    })
})

routeTest('bookingController', [
    {
        verb: verbs.GET,
        route: '/api/bookings',
        method: 'GetAllBookings',
        ignoreId: true
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id',
        method: 'GetBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/spot',
        method: 'GetSpotForBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/start',
        method: 'GetStartOfBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/duration',
        method: 'GetDurationForBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/end',
        method: 'GetEndOfBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/time',
        method: 'GetTimeOfBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/price',
        method: 'GetPriceOfBooking'
    },
    {
        verb: verbs.PUT,
        route: '/api/bookings/:id/pay',
        method: 'PayForBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/status',
        method: 'GetStatusOfBooking'
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
            app.db.bookings = {
                find: mockPromise(bookings)
            }
            var simpleBookings = bookings.map(function(b) {
                return b.toJSON({getters: true});
            });
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(simpleBookings)).to.be.true;
                done();
            }
            app.bookingController.GetAllBookings(null, res);
        })
    })
    
    describe('GetBooking', function() {
        it('should get booking with specified id', function(done) {
            var booking = new Booking();
            app.db.bookings = {
                findById: mockPromise(booking)
            }
            var simpleBooking = booking.toJSON({getters: true});
            req.params.id = booking.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(simpleBooking)).to.be.true;
                done();
            }
            app.bookingController.GetBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetBooking(req, res);
        })
    })
            
    describe('GetSpotForBooking', function() {
        it('should return error if booking has no spot attached', function(done) {
            var booking = new Booking();
            var mp = mockPromise(booking)
            app.db.bookings = {
                findById: mp
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })

        it('should return the spot associated with the booking', function(done) {
            var spot = new Spot();
            var booking = new Booking();
            booking.spot = spot;
            var mp = mockPromise(booking);
            app.db.bookings = {
                findById: mp
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(spot.toJSON({getters: true}))).to.be.true;
                done();
            };
            app.bookingController.GetSpotForBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            var mp = mockPromise(null, 'some error');
            app.db.bookings = {
                findById: mp
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            var mp = mockPromise(null, null);
            app.db.bookings = {
                findById: mp
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })
        
        it('should error if db encountered error looking for spot', function(done) {
            var bmp = mockPromise(new Booking());
            var smp = mockPromise(null, 'some error');
            app.db.bookings = {
                findById: bmp
            }
            app.db.spots = {
                findById: smp
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })
        
        it('should return error if spot found is null', function() {
            var bmp = mockPromise(new Booking());
            var smp = mockPromise(null, null);
            app.db.bookings = {
                findById: bmp
            }
            app.db.spots = {
                findById: smp
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })
    })
    
        
        
        
        
    
    describe('GetStartOfBooking', function() {
        it('should return the booking start time', function(done) {
            var b = new Booking();
            var start = new Date();
            b.start = start;
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(start)).to.be.true;
                done();
            }
            app.bookingController.GetStartOfBooking(req, res);
            
        });
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetStartOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetStartOfBooking(req, res);
        })
    })
    
        
        
    
    describe('GetDurationForBooking', function() {
        it('should return the booking duration', function() {
            var b = new Booking();
            b.start = new Date('2016/01/01');
            b.end = new Date();
            var dur = b.end - b.start;
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(dur), res.send.firstCall.args[0]).to.be.true;
                done();
            }
            app.bookingController.GetDurationForBooking(req, res);
        });
        
        it('should return error if schema getDuration returned error', function(done) {
            var b = new Booking();
            sinon.stub(b, 'setDuration', function() {
                return new Promise(function(s,e) {
                    e('some error');
                })
            });
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetDurationForBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetDurationForBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetDurationForBooking(req, res);
        })
    })
    
        
        
    
    describe('GetEndOfBooking', function() {
        it('should return the booking end time', function(done) {
            var b = new Booking();
            var end = new Date();
            b.end = end;
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(end)).to.be.true;
                done();
            }
            app.bookingController.GetEndOfBooking(req, res);
        });
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetEndOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetEndOfBooking(req, res);
        })
    })
    
        
        
    
    describe('GetTimeOfBooking', function() {
        it('should return the booking start and end time', function(done) {
            var b = new Booking();
            var start = new Date('2016/01/01');
            var end = new Date('2016/01/01');
            b.end = end;
            b.start = start;
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({start: start, end: end})).to.be.true;
                done();
            }
            app.bookingController.GetTimeOfBooking(req, res);
        });
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetTimeOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetTimeOfBooking(req, res);
        })
    })
    
                    
        

    describe('GetPriceOfBooking', function() {
        it('should return the price of the booking', function(done) {
            var b = new Booking();
            var price = 123.45;
            b.price = price;
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(price)).to.be.true;
                done();
            }
            app.bookingController.GetPriceOfBooking(req, res);
        });
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetPriceOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetPriceOfBooking(req, res);
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

        it('should mark booking as paid if charge is successful', function(done) {
            var b = new Booking();
            b.price = 123.45;
            b.pay = sinon.spy(function() {
                return Promise.resolve();
            });
            app.db.bookings = {
                findById: mockPromise(b)
            }
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
            var b = new Booking();
            b.price = 123.45;
            b.pay = function() { return Promise.resolve() };
            app.db.bookings = {
                findById: mockPromise(b)
            }
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
            var b = new Booking();
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            req.body.token = 'sometoken';
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(charge.callCount).to.equal(0);
                done();
            }
            app.bookingController.PayForBooking(req, res);
        })

        it('should fail if not passed proper token', function(done) {
            var b = new Booking();
            b.price = 123.45;
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(charge.callCount).to.equal(0);
                done();
            }
            app.bookingController.PayForBooking(req, res);
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            app.bookingController.PayForBooking(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            app.bookingController.PayForBooking(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })
    })

    describe('GetStatusOfBooking', function() {
        it('should return the status of the booking', function(done) {
            var b = new Booking();
            var status = 'paid';
            b.status = status;
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.params.id = b.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(status)).to.be.true;
                done();
            }
            app.bookingController.GetStatusOfBooking(req, res);
        });
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetStatusOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetStatusOfBooking(req, res);
        })
    })
})