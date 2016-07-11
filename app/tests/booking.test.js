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
        verb: verbs.PUT,
        route: '/api/bookings',
        method: 'CreateBooking',
        ignoreId: true
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/spot',
        method: 'GetSpotForBooking'
    },
    {
        verb: verbs.PUT,
        route: '/api/bookings/:id/spot',
        method: 'SetSpotForBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/start',
        method: 'GetStartOfBooking'
    },
    {
        verb: verbs.PUT,
        route: '/api/bookings/:id/start',
        method: 'SetStartOfBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/duration',
        method: 'GetDurationForBooking'
    },
    {
        verb: verbs.PUT,
        route: '/api/bookings/:id/duration',
        method: 'SetDurationForBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/end',
        method: 'GetEndOfBooking'
    },
    {
        verb: verbs.PUT,
        route: '/api/bookings/:id/end',
        method: 'SetEndOfBooking'
    },
    {
        verb: verbs.GET,
        route: '/api/bookings/:id/time',
        method: 'GetTimeOfBooking'
    },
    {
        verb: verbs.PUT,
        route: '/api/bookings/:id/time',
        method: 'SetTimeOfBooking'
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
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetBooking(req, res);
        })
    })
    
    describe('CreateBooking', function() {
        var emptyBooking;
        
        before(function() {
            emptyBooking = new Booking().toJSON();
            delete emptyBooking._id;    
        })
        
        it('should send error if req count is invalid (and not null)', function(done) {
            [
                'abc',
                {},
                function(){expect.fail()},
                []
            ].forEach(function(input, i, arr) {
                req.body.count = input;
                res.sent = function() {
                    if (res.send.callCount >= arr.length) {
                        expect(res.sendBad.callCount).to.equal(res.send.callCount);
                        done();
                    }
                }
                app.bookingController.CreateBooking(req, res);
            })
        })
        
        it('if couldnt create booking should send error', function(done) {
            app.db.bookings = {
                create: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.CreateBooking(req, res);
        })
        
        it('if couldnt insert entire collection should send error', function(done) {
            app.db.bookings = {
                collection: {
                    insert: mockPromise(null, 'some error')
                }
            }
            req.body.count = 5;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.CreateBooking(req, res);
        })
        
        it('should create n bookings with the given props', function(done) {
            var count = 5;
            var booking = Object.assign({}, emptyBooking);
            var arr = [];
            for (var i=0;i<count;i++)
                arr.push(booking);
            booking.start = new Date();
            app.db.bookings = {
                collection: {
                    insert: function(obj) {
                        expect(obj).to.have.length(count);
                        expect(obj[0]).to.have.property('start');
                        for (var i=0; i < count; i++) {
                            arr[i]._id = obj[i]._id;
                            expect(obj[i]).to.deep.equal(arr[i]);
                        }
                        return mockPromise(obj)();
                    }
                }
            }
            res.sent = function() {
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
                done();
            }
            req.body.count = count;
            req.body.booking = booking;
            app.bookingController.CreateBooking(req, res);
        })
        
        it('should create a booking with the given props', function(done) {
            var booking = Object.assign({}, emptyBooking);
            booking.start = new Date();
            app.db.bookings = {
                create: function(obj) {
                    expect(obj).to.have.property('start');
                    return mockPromise(obj)();
                }
            }
            req.body.booking = booking;
            res.sent = function() {
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
                done();
            }
            app.bookingController.CreateBooking(req, res);
        })
        
        it('should create a blank booking given no params', function(done) {
            app.db.bookings = {
                create: function(obj) {
                    expect(obj).to.deep.equal(emptyBooking);
                    return mockPromise(obj)();
                }
            }
            res.sent = function() {
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
                done();
            }
            app.bookingController.CreateBooking(req, res);
        })
        
        it('should create n blank bookings given a count n', function(done) {
            var count = 5;
            var arr = [];
            for (var i=0;i<count;i++)
                arr.push(emptyBooking);
            app.db.bookings = {
                collection: {
                    insert: function(obj) {
                        expect(obj).to.have.length(count);
                        for (var i=0; i < count; i++) {
                            arr[i]._id = obj[i]._id;
                            expect(obj[i]).to.deep.equal(arr[i]);
                        }
                        return mockPromise(obj)();
                    }
                }
            }
            req.body.count = count;
            res.sent = function() {
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
                done();
            }
            app.bookingController.CreateBooking(req, res);
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetSpotForBooking(req, res);
        })
    })
    
    describe('SetSpotForBooking', function(only) {
        it('should associate the booking with the spot', function(done) {
            var booking = new Booking();
            booking.setSpot = function() {
                return new Promise(function(s) {
                    s(booking)
                })
            };
            var spot = new Spot();
            app.db.bookings = {
                findById: mockPromise(booking)
            }
            app.db.spots = {
                findById: mockPromise(spot)
            }
            req.body = spot;
            req.params.id = booking.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetSpotForBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            var bmp = mockPromise(null, 'some error');
            var smp = mockPromise(new Spot());
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
            app.bookingController.SetSpotForBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            var bmp = mockPromise(null);
            var smp = mockPromise(new Spot());
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
            app.bookingController.SetSpotForBooking(req, res);
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
            app.db.spots = {
                findById: smp
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetSpotForBooking(req, res);
        })
        
        it('should return error if spot found is null', function(done) {
            var bmp = mockPromise(new Booking());
            var smp = mockPromise(null);
            app.db.bookings = {
                findById: bmp
            }
            app.db.spots = {
                findById: smp
            }
            app.db.spots = {
                findById: smp
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetSpotForBooking(req, res);
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
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetStartOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetStartOfBooking(req, res);
        })
    })
    
    describe('SetStartOfBooking', function() {
        it('should set start time for booking', function(done) {
            var start = new Date();
            var b = new Booking();
            sinon.stub(b, 'setStart', function() {
                return new Promise(function(s) {
                    s(b)
                })
            });
            app.db.bookings = {
                findById: mockPromise(b)
            }
            expect(b.start).to.not.be.ok;
            req.body.start = start;
            res.sent = function() {
                expect(b.setStart.calledOnce).to.be.true;
                expect(b.setStart.calledWith(start)).to.be.true;
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetStartOfBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetStartOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetStartOfBooking(req, res);
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
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetDurationForBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetDurationForBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetDurationForBooking(req, res);
        })
    })
    
    describe('SetDurationForBooking', function() {
        it('should set duration for booking', function(done) {
            var b = new Booking();
            b.start = new Date('2016/01/01');
            var duration = 123456789;
            var end = new Date(b.start.valueOf() + duration); 
            sinon.stub(b, 'setDuration', function() {
                return new Promise(function(s) {
                    s(b)
                })
            });
            app.db.bookings = {
                findById: mockPromise(b)
            }
            expect(b.end).to.not.be.ok;
            req.body.duration = duration;
            res.sendBad = done;
            res.sent = function() {
                expect(b.setDuration.calledOnce).to.be.true;
                expect(b.setDuration.calledWith(duration)).to.be.true;
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetDurationForBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetDurationForBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetDurationForBooking(req, res);
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
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetEndOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetEndOfBooking(req, res);
        })
    })
    
    describe('SetEndOfBooking', function() {
        it('should set end time for booking', function(done) {
            var end = new Date();
            var b = new Booking();
            sinon.stub(b, 'setEnd', function() {
                return new Promise(function(s) {
                    s(b)
                })
            });
            app.db.bookings = {
                findById: mockPromise(b)
            }
            expect(b.end).to.not.be.ok;
            req.body.end = end;
            res.sent = function() {
                expect(b.setEnd.calledOnce).to.be.true;
                expect(b.setEnd.calledWith(end)).to.be.true;
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetEndOfBooking(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetEndOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetEndOfBooking(req, res);
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
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetTimeOfBooking(req, res);
        })
        
        it('should return error if booking found is null', function(done) {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.bookingController.GetTimeOfBooking(req, res);
        })
    })
    
    describe('SetTimeOfBooking', function() {
        it('should set start and end time for booking', function(done) {
            var start = new Date('2000/01/01');
            var end = new Date('2016/01/01');
            var b = new Booking();
            sinon.stub(b, 'setStart', function() {
                return new Promise(function(s) {
                    s(b)
                })
            });
            sinon.stub(b, 'setEnd', function() {
                return new Promise(function(s) {
                    s(b)
                })
            });
            app.db.bookings = {
                findById: mockPromise(b)
            }
            req.body.start = start;
            req.body.end = end;
            res.sent = function() {
                expect(b.setStart.calledOnce).to.be.true;
                expect(b.setStart.calledWith(start)).to.be.true;
                expect(b.setEnd.calledOnce).to.be.true;
                expect(b.setEnd.calledWith(end)).to.be.true;
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.bookingController.SetTimeOfBooking(req, res);
        })
                    
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: mockPromise(null, 'some error')
            }
            app.bookingController.SetTimeOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            app.bookingController.SetTimeOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
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
                expect(res.send.calledOnce).to.be.true;
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
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
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
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: mockPromise(null)
            }
            app.bookingController.PayForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })
    })
})