var expect = require('chai').expect;
var sinon = require('sinon');
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
        expect(b.archived).to.be.false;
    })
    
    describe('archive', function() {
        it('should set archived to true', function(done) {
            var b = new Booking();
            expect(b.archived).to.be.false;
            b.archive(function(err) {
                expect(err).to.not.be.ok;
                expect(b.archived).to.be.true;
                done();
            })
        })
    })
    
    describe('getSpot', function() {
        it('should return spot id', function() {
            var b = new Booking();
            var spotId = '1z2x3c4v';
            b.spot = spotId;
            expect(b.getSpot()).to.equal(spotId);
        })
        
        it('should error if no spot id', function() {
            var b = new Booking();
            var result = b.getSpot();
            expect(result).to.be.an.instanceof(Error);
        })
    })
    
    describe('setSpot', function() {
        it('should set spot id', function(done) {
            var b = new Booking();
            var spotId = '1z2x3c4v';
            expect(b.spot).to.not.be.ok;
            b.setSpot(spotId, function(err) {
                expect(err).to.not.be.ok;
                expect(b.spot).to.equal(spotId);
                done();
            });
        })
        
        it('should accept spot objects', function(done) {
            var b = new Booking();
            var s = new Spot();
            expect(b.spot).to.not.be.ok;
            b.setSpot(s, function(err) {
                expect(err).to.not.be.ok;
                expect(b.spot).to.equal(s.id);
                done();
            })
        })
        
        it('should error if invalid spot id', function(done) {
            var b = new Booking();
            [
                null,
                undefined,
                123,
                true,
                ''
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
        
        it('should error if no start time set', function() {
            var b = new Booking();
            var result = b.getStart();
            expect(result).to.be.an.instanceof(Error);
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
            var duration = new Date() - b.start; 
            b.duration = duration;
            expect(b.getDuration()).to.equal(duration);
        })
        
        it('should error if no start time set', function() {
            var b = new Booking();
            b.duration = 666;
            var result = b.getDuration();
            expect(result).to.be.an.instanceof(Error);
        })
        
        it('should error if no duration set', function() {
            var b = new Booking();
            b.start = new Date();
            var result = b.getDuration();
            expect(result).to.be.an.instanceof(Error);
        })
    })
    
    describe('setDuration', function() {
        it('should set start', function(done) {
            var b = new Booking();
            var duration = new Date() - new Date('01/01/2000');
            expect(b.duration).to.not.be.ok;
            b.setDuration(duration, function(err) {
                expect(err).to.not.be.ok;
                expect(b.duration).to.equal(duration);
                done();
            });
        })
        
        it('should parse string values', function(done) {
            var b = new Booking();
            b.start = new Date();
            var duration = 123456789;
            expect(b.duration).to.not.be.ok;
            b.setDuration(duration.toString(), function(err) {
                expect(err).to.not.be.ok;
                expect(b.duration).to.equal(duration);
                done();
            });
        })
        
        it('should error if invalid duration', function(done) {
            var b = new Booking();
            [
                null,
                undefined,
                -1,
                true,
                ''
            ].forEach(function (input, i, arr) {
                expect(b.setDuration(input, function(err) {
                    expect(err).to.be.ok;
                    expect(b.duration).to.not.be.ok;
                    if (i + 1 >= arr.length)
                        done();
                }));
            })
        })
    })
    
    describe('getEnd', function() {
        it('should return end time', function() {
            var b = new Booking();
            var start = new Date('01/01/2000');
            var end = new Date();
            var duration = end - start; 
            b.start = start;
            b.duration = duration;
            expect(b.getEnd()).to.deep.equal(end);
        })
        
        it('should error if no end time set', function() {
            var b = new Booking();
            var result = b.getEnd();
            expect(result).to.be.an.instanceof(Error);
        })
    })
    
    describe('setEnd', function() {
        it('should set end time', function(done) {
            var b = new Booking();
            var start = new Date('01/01/2000');
            var end = new Date();
            var duration = end - start;
            b.start = start;
            b.duration = 10;
            b.setEnd(end, function(err) {
                expect(err).to.not.be.ok;
                expect(b.duration).to.equal(duration);
                done();
            });
        })
        
        it('should parse strings into date objects', function(done) {
            var b = new Booking();
            var start = new Date();
            b.start = start;
            var str = '01/01/2099';
            var end = new Date(str);
            expect(b.end).to.not.be.ok;
            b.setEnd(str, function(err) {
                expect(err).to.not.be.ok;
                expect(b.duration).to.deep.equal(end - start);
                done();
            })
        })
        
        it('should error if invalid end time', function(done) {
            var b = new Booking();
            var dur = b.duration;
            [
                null,
                undefined,
                true,
                ''
            ].forEach(function (input, i, arr) {
                expect(b.setEnd(input, function(err) {
                    expect(err).to.be.ok;
                    expect(b.duration).to.equal(dur);
                    if (i + 1 >= arr.length)
                        done();
                }));
            })
        })
    })
})

describe('bookingController', function() {
    var app;
    
    describe('route', function() {
        routeTest('bookingController', [
            {
                verb: verbs.GET,
                route: '/api/bookings',
                method: 'GetAllBookings',
                dbInjection: {
                    bookings: {
                        find: sinon.spy(function(search, cb) {
                            expect(search).to.eql({});
                            cb(null, [{someProp:'some value'},{someProp:'some other value'}]);
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        find: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: [{someProp:'some value'},{someProp:'some other value'}],
                ignoreId: true
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id',
                method: 'GetBooking',
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {someProp:'some value'});
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: {someProp:'some value'}
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/spot',
                method: 'GetSpotForBooking',
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                getSpot: function() { return '1z2x3c' }
                            });
                        })
                    },
                    spots: {
                        findById: function(id, cb) {
                            expect(id).to.equal('1z2x3c');
                            cb(null, {someProp: 'some value'});
                        }
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: {someProp:'some value'}
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/spot',
                method: 'SetSpotForBooking',
                body: {
                    id: '1z2x3c'
                },
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                setSpot: function(spot, finish) {
                                    expect(spot).to.deep.equal({someProp: 'some value'}); 
                                    finish();
                                }
                            });
                        })
                    },
                    spots: {
                        findById: function(id, cb) {
                            expect(id).to.equal('1z2x3c');
                            cb(null, {someProp: 'some value'});
                        }
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: function(id,cb) {
                            cb(new Error());
                        }
                    },
                    spots: {
                        findById: function(id, cb) {
                            cb(new Error());
                        }
                    }
                }
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/start',
                method: 'GetStartOfBooking',
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                getStart: function() { return new Date('01/01/2000'); }
                            });
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: new Date('01/01/2000').toJSON()
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/start',
                method: 'SetStartOfBooking',
                body: {
                    start: new Date('01/01/2000')
                },
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                setStart: function(date, cb) { 
                                    expect(date).to.deep.equal(new Date('01/01/2000').toJSON());
                                    cb();    
                                }
                            });
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(new Error());
                        })
                    }
                }
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/duration',
                method: 'GetDurationForBooking',
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                getDuration: function() { return 123456789 }
                            });
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: 123456789
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/duration',
                method: 'SetDurationForBooking',
                body: {
                    duration: 123456789
                },
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                setDuration: function(duration, cb) { 
                                    expect(duration).to.deep.equal(123456789);
                                    cb();    
                                }
                            });
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(new Error());
                        })
                    }
                }
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/end',
                method: 'GetEndOfBooking',
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                getEnd: function() { return new Date('01/01/2000'); }
                            });
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: new Date('01/01/2000').toJSON()
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/end',
                method: 'SetEndOfBooking',
                body: {
                    end: new Date('01/01/2000')
                },
                dbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {
                                setEnd: function(date, cb) { 
                                    expect(date).to.deep.equal(new Date('01/01/2000').toJSON());
                                    cb();
                                }
                            });
                        })
                    }
                },
                sadDbInjection: {
                    bookings: {
                        findById: sinon.spy(function(search, cb) {
                            cb(new Error());
                        })
                    }
                }
            }
        ])
    })
    
    describe('method', function() {
        var req = {},
            res = {};
        
        beforeEach(function() {
            app = server(server.GetDefaultInjection());
            req = {
                body: {},
                params: {
                    id: 'user.id'
                }
            }
            res = {
                status: sinon.spy(function(s) {
                    return this;
                }),
                send: sinon.spy(),
                sendStatus: sinon.spy()
            }
        })
        
        describe('GetAllBookings', function() {
            it('should return all bookings', function() {
                var bookings = [new Booking(), new Booking()];
                app.db.bookings = {
                    find: function(obj, cb) {
                        cb(null, bookings);
                    }
                }
                app.bookingController.GetAllBookings(null, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(bookings)).to.be.true;
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
                req.params.id = booking.id;
                app.bookingController.GetBooking(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(booking)).to.be.true;
            })
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
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
                
        describe('GetSpotForBooking', function() {
            it('should return the spot associated with the booking', function() {
                var spot = new Spot();
                var booking = new Booking();
                booking.setSpot(spot);
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
                app.bookingController.GetSpotForBooking(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(spot)).to.be.true;
            })
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
                    }
                }
                app.bookingController.GetSpotForBooking(req, res);
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
                app.bookingController.GetSpotForBooking(req, res);
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
                        cb(new Error(), null);
                    }
                }
                app.bookingController.GetSpotForBooking(req, res);
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
        
        describe('SetSpotForBooking', function() {
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
                expect(res.sendStatus.calledOnce).to.be.true;
            })
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
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
                        cb(new Error(), null);
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
                expect(res.send.calledWith(start)).to.be.true;
            });
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
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
                expect(res.sendStatus.calledOnce)
                expect(res.sendStatus.calledWith(200)).to.be.true;
            })
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
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
                var duration = 123456789;
                b.duration = duration;
                b.start = new Date();
                app.db.bookings = {
                    findById: function(id, cb) {
                        expect(id).to.equal(b.id);
                        cb(null, b);
                    }
                }
                req.params.id = b.id;
                app.bookingController.GetDurationForBooking(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(duration.toString())).to.be.true;
            });
            
            it('should return error if schema getDuration returned error', function() {
                var b = new Booking();
                sinon.stub(b, 'getDuration', function() {
                    return new Error('some message');
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
                        cb(new Error(), null);
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
                var duration = 123456789;
                var b = new Booking();
                sinon.stub(b, 'setDuration', function(t, cb) {
                    expect(t).to.equal(duration);
                    cb();
                });
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(null, b);
                    }
                }
                expect(b.duration).to.not.be.ok;
                req.body.duration = duration;
                app.bookingController.SetDurationForBooking(req, res);
                expect(b.setDuration.calledOnce).to.be.true;
                expect(b.setDuration.calledWith(duration)).to.be.true;
                expect(res.sendStatus.calledOnce)
                expect(res.sendStatus.calledWith(200)).to.be.true;
            })
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
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
                var start = new Date('01/01/2000');
                var end = new Date();
                var duration = end - start;
                b.start = start;
                b.duration = duration;
                app.db.bookings = {
                    findById: function(id, cb) {
                        expect(id).to.equal(b.id);
                        cb(null, b);
                    }
                }
                req.params.id = b.id;
                app.bookingController.GetEndOfBooking(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(end)).to.be.true;
            });
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
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
                expect(res.sendStatus.calledOnce)
                expect(res.sendStatus.calledWith(200)).to.be.true;
            })
            
            it('should error if db encountered error', function() {
                app.db.bookings = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
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
    })
})