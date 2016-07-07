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
        it('should set status to archived', function(done) {
            var b = new Booking();
            expect(b.status).to.not.equal(Booking.status.archived);
            b.archive(function(err) {
                expect(err).to.not.be.ok;
                expect(b.status).to.equal(Booking.status.archived);
                done();
            })
        })
    })

    describe('pay', function() {
        it('should set status to paid', function(done) {
            var b = new Booking();
            expect(b.status).to.not.equal(Booking.status.paid);
            b.pay(function(err) {
                expect(err).to.not.be.ok;
                expect(b.status).to.equal(Booking.status.paid);
                done();
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
        it('should set the price', function(done) {
            var b = new Booking();
            var price = 123.45;
            var durationInHours = 2;
            b.start = new Date('2016/01/01 0:00');
            b.end = new Date('2016/01/01 2:00');
            var s = new Spot();
            s.price.perHour = price;
            expect(b.spot).to.not.be.ok;
            expect(b.price).to.not.be.ok;
            b.setSpot(s, function(err) {
                expect(err, err).to.not.be.ok;
                expect(b.price).to.equal(price * durationInHours);
                done();
            });
        })

        it('should accept spot objects', function(done) {
            var b = new Booking();
            var s = new Spot();
            s.price.perHour = 123.45;
            expect(b.spot).to.not.be.ok;
            b.setSpot(s, function(err) {
                expect(err, err).to.not.be.ok;
                expect(b.spot).to.deep.equal(s._id);
                done();
            })
        })
        
        it('should error if invalid spot', function(done) {
            var b = new Booking();
            [
                null,
                undefined,
                123,
                true,
                '',
                {},
                {someBadProp: 'some unimportant value'}
            ].forEach(function (input, i, arr) {
                expect(b.setSpot(input, function(err) {
                    expect(err).to.be.ok;
                    expect(b.spot).to.not.be.ok;
                    if (i + 1 >= arr.length)
                        done();
                }));
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
        it('should set start time', function(done) {
            var b = new Booking();
            var start = new Date();
            expect(b.start).to.not.be.ok;
            b.setStart(start, function(err) {
                expect(err).to.not.be.ok;
                expect(b.start).to.deep.equal(start);
                done();
            });
        })
        
        it('should parse strings into date objects', function(done) {
            var b = new Booking();
            var str = '01/01/2000';
            var start = new Date(str);
            expect(b.start).to.not.be.ok;
            b.setStart(str, function(err) {
                expect(err).to.not.be.ok;
                expect(b.start).to.deep.equal(start);
                done();
            })
        })
        
        it('should error if invalid start time', function(done) {
            var b = new Booking();
            [
                null,
                undefined,
                true,
                ''
            ].forEach(function (input, i, arr) {
                expect(b.setStart(input, function(err) {
                    expect(err).to.be.ok;
                    expect(b.start).to.not.be.ok;
                    if (i + 1 >= arr.length)
                        done();
                }));
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
        it('should error if no start time set', function(done) {
            var b = new Booking();
            var end = b.end = new Date(); 
            b.setDuration(123, function(err) {
                expect(err).to.be.ok;
                expect(b.end).to.deep.equal(end);
                done();
            });
        })
        
        it('should set start', function(done) {
            var b = new Booking();
            b.start = new Date('01/01/2000');
            var end = new Date();
            var duration = end - b.start;
            expect(b.end).to.not.be.ok; 
            b.setDuration(duration, function(err) {
                expect(err).to.not.be.ok;
                expect(b.end).to.deep.equal(end);
                done();
            });
        })
        
        it('should parse string values', function(done) {
            var b = new Booking();
            b.start = new Date('2016/01/01');
            var end = new Date();
            var duration = end - b.start;
            expect(b.end).to.not.be.ok;
            b.setDuration(duration.toString(), function(err) {
                expect(err).to.not.be.ok;
                expect(b.end).to.deep.equal(end);
                done();
            });
        })
        
        it('should error if invalid duration', function(done) {
            var b = new Booking();
            var start = b.start = new Date('2016/01/01');
            var end = b.end = new Date();
            [
                null,
                undefined,
                -1,
                true,
                ''
            ].forEach(function (input, i, arr) {
                expect(b.setDuration(input, function(err) {
                    expect(err).to.be.ok;
                    expect(b.start).to.deep.equal(start);
                    expect(b.end).to.deep.equal(end);
                    if (i + 1 >= arr.length)
                        done();
                }));
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
        it('should set end time', function(done) {
            var b = new Booking();
            var end = new Date();
            expect(b.end).to.not.be.ok;
            b.setEnd(end, function(err) {
                expect(err).to.not.be.ok;
                expect(b.end).to.deep.equal(end);
                done();
            });
        })
        
        it('should parse strings into date objects', function(done) {
            var b = new Booking();
            var str = '01/01/2099';
            var end = new Date(str);
            expect(b.end).to.not.be.ok;
            b.setEnd(str, function(err) {
                expect(err).to.not.be.ok;
                expect(b.end).to.deep.equal(end);
                done();
            })
        })
        
        it('should error if invalid end time', function(done) {
            var b = new Booking();
            expect(b.end).to.not.be.ok;
            [
                null,
                undefined,
                true,
                ''
            ].forEach(function (input, i, arr) {
                expect(b.setEnd(input, function(err) {
                    expect(err).to.be.ok;
                    expect(b.end).to.not.be.ok;
                    if (i + 1 >= arr.length)
                        done();
                }));
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
        it('should return all bookings', function() {
            var bookings = [new Booking(), new Booking()];
            app.db.bookings = {
                find: function(obj, cb) {
                    cb(null, bookings);
                }
            }
            var simpleBookings = bookings.map(function(b) {
                return b.toJSON({getters: true});
            });
            app.bookingController.GetAllBookings(null, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(simpleBookings)).to.be.true;
        })
    })
    
    describe('GetBooking', function() {
        it('should get booking with specified id', function() {
            var booking = new Booking();
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(booking.id);
                    cb(null, booking);
                }
            }
            var simpleBooking = booking.toJSON({getters: true});
            req.params.id = booking.id;
            app.bookingController.GetBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(simpleBooking)).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.GetBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.GetBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('CreateBooking', function() {
        var emptyBooking;
        
        before(function() {
            emptyBooking = new Booking().toJSON();
            delete emptyBooking._id;    
        })
        
        it('should send error if req count is invalid (and not null)', function() {
            [
                'abc',
                {},
                function(){expect.fail()},
                []
            ].forEach(function(input) {
                req.body.count = input;
                app.bookingController.CreateBooking(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                res.status.reset();
                res.send.reset();
            })
        })
        
        it('if couldnt create booking should send error', function() {
            app.db.bookings = {
                create: function(obj, cb) {
                    cb('some error');
                }
            }
            app.bookingController.CreateBooking(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
        })
        
        it('if couldnt insert entire collection should send error', function() {
            app.db.bookings = {
                collection: {
                    insert: function(obj, cb) {
                        cb('some error');
                    }
                }
            }
            req.body.count = 5;
            app.bookingController.CreateBooking(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
        })
        
        it('should create n bookings with the given props', function() {
            var count = 5;
            var booking = Object.assign({}, emptyBooking);
            var arr = [];
            for (var i=0;i<count;i++)
                arr.push(booking);
            booking.start = new Date();
            app.db.bookings = {
                collection: {
                    insert: function(obj, cb) {
                        expect(obj).to.have.length(count);
                        expect(obj[0]).to.have.property('start');
                        expect(obj).to.deep.include.all.members(arr);
                        cb(null, obj);
                    }
                }
            }
            req.body.count = count;
            req.body.booking = booking;
            app.bookingController.CreateBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
        
        it('should create a booking with the given props', function() {
            var booking = Object.assign({}, emptyBooking);
            booking.start = new Date();
            app.db.bookings = {
                create: function(obj, cb) {
                    expect(obj).to.have.property('start');
                    cb(null, obj);
                }
            }
            req.body.booking = booking;
            app.bookingController.CreateBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
        
        it('should create a blank booking given no params', function() {
            app.db.bookings = {
                create: function(obj, cb) {
                    expect(obj).to.deep.equal(emptyBooking);
                    cb(null, obj);
                }
            }
            app.bookingController.CreateBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
        
        it('should create n blank bookings given a count n', function() {
            var count = 5;
            var arr = [];
            for (var i=0;i<count;i++)
                arr.push(emptyBooking);
            app.db.bookings = {
                collection: {
                    insert: sinon.spy(function(obj, cb) {
                        expect(obj).to.have.length(count);
                        expect(obj).to.deep.include.all.members(arr);
                        cb(null, obj);
                    })
                }
            }
            req.body.count = count;
            app.bookingController.CreateBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
    })
            
    describe('GetSpotForBooking', function() {
        it('should return error if booking has no spot attached', function() {
            var booking = new Booking();
            var mp = mockPromise(booking)
            app.db.bookings = {
                findById: mp
            }
            app.bookingController.GetSpotForBooking(req, res);
            return Promise.all([mp]).then(function() {
                expect(res.sendBad.calledOnce).to.be.true;
            })
        })

        it('should return the spot associated with the booking', function() {
            var spot = new Spot();
            var booking = new Booking();
            booking.spot = spot;
            var mp = mockPromise(booking);
            app.db.bookings = {
                findById: mp
            }
            app.bookingController.GetSpotForBooking(req, res);
            return Promise.all([mp]).then(function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(spot.toJSON({getters: true}))).to.be.true;
            });
        })
        
        it('should error if db encountered error', function() {
            var mp = mockPromise(null, 'some error');
            app.db.bookings = {
                findById: mp
            }
            app.bookingController.GetSpotForBooking(req, res);
            return Promise.all([mp]).then(function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        it('should return error if booking found is null', function() {
            var mp = mockPromise(null, null);
            app.db.bookings = {
                findById: mp
            }
            app.bookingController.GetSpotForBooking(req, res);
            return Promise.all([mp]).then(function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        it('should error if db encountered error looking for spot', function() {
            var bmp = mockPromise(new Booking());
            var smp = mockPromise(null, 'some error');
            app.db.bookings = {
                findById: bmp
            }
            app.db.spots = {
                findById: smp
            }
            app.bookingController.GetSpotForBooking(req, res);
            return Promise.all([bmp, smp]).then(function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
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
            app.bookingController.GetSpotForBooking(req, res);
            return Promise.all([bmp, smp]).then(function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
    })
    
    describe.skip('SetSpotForBooking', function() {
        it('should associate the booking with the spot', function() {
            var spot = new Spot();
            var booking = new Booking();
            sinon.stub(booking, 'setSpot', function(s, cb) {
                expect(s).to.equal(spot);
                cb();
            });
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(booking.id);
                    cb(null, booking);
                }
            }
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(spot.id);
                    cb(null, spot);
                }
            }
            req.params.id = booking.id;
            req.body = spot;
            app.bookingController.SetSpotForBooking(req, res);
            expect(booking.setSpot.calledOnce).to.be.true;
            expect(booking.setSpot.calledWith(spot)).to.be.true;
            expect(res.sendGood.calledOnce).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.SetSpotForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.SetSpotForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should error if db encountered error looking for spot', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, new Booking());
                }
            }
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.SetSpotForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, new Booking());
                }
            }
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.GetSpotForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('GetStartOfBooking', function() {
        it('should return the booking start time', function() {
            var b = new Booking();
            var start = new Date();
            b.start = start;
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            app.bookingController.GetStartOfBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(start)).to.be.true;
        });
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.GetStartOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.GetStartOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('SetStartOfBooking', function() {
        it('should set start time for booking', function() {
            var start = new Date();
            var b = new Booking();
            sinon.stub(b, 'setStart', function(t, cb) {
                expect(t).to.equal(start);
                cb();
            });
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, b);
                }
            }
            expect(b.start).to.not.be.ok;
            req.body.start = start;
            app.bookingController.SetStartOfBooking(req, res);
            expect(b.setStart.calledOnce).to.be.true;
            expect(b.setStart.calledWith(start)).to.be.true;
            expect(res.sendGood.calledOnce).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.SetStartOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.SetStartOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })            
    })
    
    describe('GetDurationForBooking', function() {
        it('should return the booking duration', function() {
            var b = new Booking();
            b.start = new Date('2016/01/01');
            b.end = new Date();
            var dur = b.end - b.start;
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            app.bookingController.GetDurationForBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(dur), res.send.firstCall.args[0]).to.be.true;
        });
        
        it('should return error if schema getDuration returned error', function() {
            var b = new Booking();
            sinon.stub(b, 'getDuration', function() {
                return null;
            })
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            app.bookingController.GetDurationForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.GetDurationForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.GetDurationForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('SetDurationForBooking', function() {
        it('should set duration for booking', function() {
            var b = new Booking();
            b.start = new Date('2016/01/01');
            var duration = 123456789;
            var end = new Date(b.start.valueOf() + duration); 
            sinon.stub(b, 'setDuration', function(t, cb) {
                expect(t).to.equal(duration);
                cb();
            });
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, b);
                }
            }
            expect(b.end).to.not.be.ok;
            req.body.duration = duration;
            app.bookingController.SetDurationForBooking(req, res);
            expect(b.setDuration.calledOnce).to.be.true;
            expect(b.setDuration.calledWith(duration)).to.be.true;
            expect(res.sendGood.calledOnce).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.SetDurationForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.SetDurationForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })            
    })
    
    describe('GetEndOfBooking', function() {
        it('should return the booking end time', function() {
            var b = new Booking();
            var end = new Date();
            b.end = end;
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            app.bookingController.GetEndOfBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(end)).to.be.true;
        });
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.GetEndOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.GetEndOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('SetEndOfBooking', function() {
        it('should set end time for booking', function() {
            var end = new Date();
            var b = new Booking();
            sinon.stub(b, 'setEnd', function(t, cb) {
                expect(t).to.equal(end);
                cb();
            });
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, b);
                }
            }
            expect(b.end).to.not.be.ok;
            req.body.end = end;
            app.bookingController.SetEndOfBooking(req, res);
            expect(b.setEnd.calledOnce).to.be.true;
            expect(b.setEnd.calledWith(end)).to.be.true;
            expect(res.sendGood.calledOnce).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.SetEndOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.SetEndOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })            
    })
    
    describe('GetTimeOfBooking', function() {
        it('should return the booking start and end time', function() {
            var b = new Booking();
            var start = new Date('2016/01/01');
            var end = new Date('2016/01/01');
            b.end = end;
            b.start = start;
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            app.bookingController.GetTimeOfBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({start: start, end: end})).to.be.true;
        });
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.GetTimeOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.GetTimeOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('SetTimeOfBooking', function() {
        it('should set start and end time for booking', function() {
            var start = new Date('2000/01/01');
            var end = new Date('2016/01/01');
            var b = new Booking();
            sinon.stub(b, 'setStart', function(t, cb) {
                expect(t).to.equal(start);
                cb();
            });
            sinon.stub(b, 'setEnd', function(t, cb) {
                expect(t).to.equal(end);
                cb();
            });
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, b);
                }
            }
            req.body.start = start;
            req.body.end = end;
            app.bookingController.SetTimeOfBooking(req, res);
            expect(b.setStart.calledOnce).to.be.true;
            expect(b.setStart.calledWith(start)).to.be.true;
            expect(b.setEnd.calledOnce).to.be.true;
            expect(b.setEnd.calledWith(end)).to.be.true;
            expect(res.sendGood.calledOnce).to.be.true;
        })
                    
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.SetTimeOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.SetTimeOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })            
    })

    describe('GetPriceOfBooking', function() {
        it('should return the price of the booking', function() {
            var b = new Booking();
            var price = 123.45;
            b.price = price;
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            app.bookingController.GetPriceOfBooking(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(price)).to.be.true;
        });
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.GetPriceOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.GetPriceOfBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })

    describe('PayForBooking', function() {
        var stripeResponse,
            charge;

        beforeEach(function() {
            stripeResponse = {someProp: 'some value'};
            inject.stripe = function(){
                this.charge = charge = sinon.spy(function(t,a,cb) {
                    cb(null, charge);
                })
            }
            app = server(inject);
        })

        it('should mark booking as paid if charge is successful', function() {
            var b = new Booking();
            b.price = 123.45;
            b.pay = sinon.spy(function(cb) {
                cb();
            });
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            req.body.token = 'sometoken';
            app.bookingController.PayForBooking(req, res);
            expect(res.sendGood.calledOnce).to.be.true;
            expect(charge.calledOnce).to.be.true;
            expect(b.pay.calledOnce).to.be.true;
        })

        it('should attempt to make a charge', function() {
            var b = new Booking();
            b.price = 123.45;
            b.pay = function(cb) { cb() };
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            req.body.token = 'sometoken';
            app.bookingController.PayForBooking(req, res);
            expect(charge.calledOnce).to.be.true;
            expect(res.sendGood.calledOnce).to.be.true;
        })

        it('should fail if booking does not have a price set', function() {
            var b = new Booking();
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            req.body.token = 'sometoken';
            app.bookingController.PayForBooking(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })

        it('should fail if not passed proper token', function() {
            var b = new Booking();
            b.price = 123.45;
            app.db.bookings = {
                findById: function(id, cb) {
                    expect(id).to.equal(b.id);
                    cb(null, b);
                }
            }
            req.params.id = b.id;
            app.bookingController.PayForBooking(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })
        
        it('should error if db encountered error', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb('some error', null);
                }
            }
            app.bookingController.PayForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })
        
        it('should return error if booking found is null', function() {
            app.db.bookings = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.bookingController.PayForBooking(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
            expect(charge.callCount).to.equal(0);
        })
    })
})