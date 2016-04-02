var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var Booking = require('./../models/Booking');

describe('Booking schema', function() {
    before(function() {
        sinon.stub(Booking.prototype, 'save', function(cb) { cb() });
    })
    
    after(function() {
        Booking.prototype.save.restore();
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
    
    describe('getSpotId', function() {
        it('should return spot id', function() {
            var b = new Booking();
            var spotId = '1z2x3c4v';
            b.spot = spotId;
            expect(b.getSpotId()).to.equal(spotId);
        })
        
        it('should error if no spot id', function() {
            var b = new Booking();
            var result = b.getSpotId();
            expect(result).to.be.an.instanceof(Error);
        })
    })
    
    describe('setSpotId', function() {
        it('should set spot id', function(done) {
            var b = new Booking();
            var spotId = '1z2x3c4v';
            expect(b.spot).to.not.be.ok;
            b.setSpotId(spotId, function(err) {
                expect(err).to.not.be.ok;
                expect(b.spot).to.equal(spotId);
                done();
            });
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
                expect(b.setSpotId(input, function(err) {
                    expect(err).to.be.ok;
                    expect(b.spot).to.not.be.ok;
                    if (i + 1 >= arr.length)
                        done();
                }));
            })
        })
    })
    
    describe('getStartTime', function() {
        it('should return start time', function() {
            var b = new Booking();
            var start = new Date();
            b.start = start;
            expect(b.getStartTime()).to.equal(start);
        })
        
        it('should error if no start time set', function() {
            var b = new Booking();
            var result = b.getStartTime();
            expect(result).to.be.an.instanceof(Error);
        })
    })
    
    describe('setStartTime', function() {
        it('should set start time', function(done) {
            var b = new Booking();
            var start = new Date();
            expect(b.start).to.not.be.ok;
            b.setStartTime(start, function(err) {
                expect(err).to.not.be.ok;
                expect(b.start).to.equal(start);
                done();
            });
        })
        
        it('should error if invalid start time', function(done) {
            var b = new Booking();
            [
                null,
                undefined,
                123,
                true,
                ''
            ].forEach(function (input, i, arr) {
                expect(b.setStartTime(input, function(err) {
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
            var duration = new Date() - new Date('01/01/2000');
            b.duration = duration;
            expect(b.getDuration()).to.equal(duration);
        })
        
        it('should error if no start time set', function() {
            var b = new Booking();
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
    
    describe('getEndTime', function() {
        it('should return end time', function() {
            var b = new Booking();
            var start = new Date('01/01/2000');
            var end = new Date();
            var duration = end - start; 
            b.start = start;
            b.duration = duration;
            expect(b.getEndTime()).to.deep.equal(end);
        })
        
        it('should error if no end time set', function() {
            var b = new Booking();
            var result = b.getEndTime();
            expect(result).to.be.an.instanceof(Error);
        })
    })
    
    describe('setEndTime', function() {
        it('should set end time', function(done) {
            var b = new Booking();
            var start = new Date('01/01/2000');
            var end = new Date();
            var duration = end - start;
            b.start = start;
            b.duration = 10;
            b.setEndTime(end, function(err) {
                expect(err).to.not.be.ok;
                expect(b.duration).to.equal(duration);
                done();
            });
        })
        
        it('should error if invalid end time', function(done) {
            var b = new Booking();
            var dur = b.duration;
            [
                null,
                undefined,
                123,
                true,
                ''
            ].forEach(function (input, i, arr) {
                expect(b.setEndTime(input, function(err) {
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
                ignoreHappyPath: true,
                ignoreSadPath: true,
                ignoreId: true
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id',
                method: 'GetBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/spot',
                method: 'GetSpotForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/spot',
                method: 'SetSpotForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/start',
                method: 'GetStartTimeForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/start',
                method: 'SetStartTimeForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/duration',
                method: 'GetDurationForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/duration',
                method: 'SetDurationForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/bookings/:id/end',
                method: 'GetEndTimeForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/bookings/:id/end',
                method: 'SetEndTimeForBooking',
                ignoreHappyPath: true,
                ignoreSadPath: true
            }
        ])
    })
})