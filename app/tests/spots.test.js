var later = require('later');
later.date.localTime();
var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var server = require('./../../server');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');
var Booking = require('./../models/Booking');

describe('Spot schema', function() {
    before(function() {
        sinon.stub(Spot.prototype, 'save', function(cb) { cb() });
    })
    
    after(function() {
        Spot.prototype.save.restore();
    })
    
    describe('getAddress', function() {
        it('should return the address of the spot', function() {
            var s = new Spot();
            var address = '123 some st'; 
            s.address = address;
            expect(s.getAddress()).to.deep.equal(address);
        });
    })
    
    describe('getLocation', function() {
        it('should return an array with the lat and long', function() {
            var s = new Spot();
            var coords = [123,456];
            s.location.coordinates = coords;
            expect(s.getLocation()).to.include.all.members(coords);
        })
        
        it('should have the long and lat as props', function() {
            var s = new Spot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = [coords_g, coords_t];
            s.location.coordinates = coords;
            var loc = s.getLocation();
            expect(loc.long).to.equal(coords_g);
            expect(loc.lat).to.equal(coords_t);
        })
    })
    
    describe('setAddress', function() {
        it('should set address given good input', function(done) {
            var s = new Spot();
            var a = '123 some st';
            expect(s.address).to.not.be.ok;
            s.setAddress(a, function(err) {
                expect(err).to.not.be.ok;
                expect(s.address).to.equal(a);
                done();
            })
        })
        
        it('should fail if given bad input', function(done) {
            var s = new Spot();
            expect(s.address).to.not.be.ok;
            [
                null,
                undefined,
                123,
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}},
                ''
            ].forEach(function(input, i, arr) {
                s.setAddress(input, function(err) {
                    expect(err).to.be.ok;
                    expect(s.address).to.not.be.ok;
                    if (i+1 >= arr.length)
                        done();
                })
            })
            
        })
        
    });
    
    describe('setLocation', function() {
        it('should set the location given an array', function(done) {
            var s = new Spot();
            var coords = [123, 456];
            s.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(s.location.coordinates).to.include.all.members(coords);
                done();
            })
        })
        
        it('should fail given a small array', function(done) {
            var s = new Spot();
            var coords = [123];
            expect(s.location.coordinates).to.have.length(0);
            s.setLocation(coords, function(err) {
                expect(err).to.be.ok;
                expect(s.location.coordinates).to.have.length(0);
                done();
            })
        })
        
        it('should fail given a large array', function(done) {
            var s = new Spot();
            var coords = [123,456,789];
            expect(s.location.coordinates).to.have.length(0);
            s.setLocation(coords, function(err) {
                expect(err).to.be.ok;
                expect(s.location.coordinates).to.have.length(0);
                done();
            })
        })
        
        it('should fail if array does not contain numbers', function(done) {
            var s = new Spot();
            expect(s.location.coordinates).have.length(0);
            [
                null,
                undefined,
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}},
                ''
            ].forEach(function(input, i, arr) {
                s.setLocation([input,input], function(err) {
                    expect(err).to.be.ok;
                    expect(s.location.coordinates).have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should parse strings into numbers for arrays', function(done) {
            var s = new Spot();
            var coords_g = '123';
            var coords_t = '456';
            var coords = [coords_g, coords_t];
            s.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(s.location.coordinates).to.include.all.members([
                    parseFloat(coords_g),
                    parseFloat(coords_t)
                ]);
                done();
            })
        })
        
        it('should set the location given an object', function(done) {
            var s = new Spot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = {
                long: coords_g,
                lat: coords_t
        };
            s.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(s.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
        
        it('should fail if not given good input', function(done) {
            var s = new Spot();
            expect(s.location.coordinates).have.length(0);
            [
                null,
                undefined,
                '123',
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}}
            ].forEach(function(input, i, arr) {
                s.setLocation(input, function(err) {
                    expect(err).to.be.ok;
                    expect(s.location.coordinates).have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should fail if object does not have long lat props', function(done) {
            var s = new Spot();
            expect(s.location.coordinates).to.have.length(0);
            [
                null,
                undefined,
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}},
                ''
            ].forEach(function(input, i, arr) {
                s.setLocation({long:input,lat:input}, function(err) {
                    expect(err).to.be.ok;
                    expect(s.location.coordinates).have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should accept lon as long prop', function(done) {
            var s = new Spot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = {
                lon: coords_g,
                lat: coords_t
        };
            s.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(s.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
        
        it('should parse strings into numbers for objects', function(done) {
            var s = new Spot();
            var coords_g = '123';
            var coords_t = '456';
            var coords = {
                long: coords_g,
                lat: coords_t
        };
            s.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(s.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
    })
    
    describe('getBookings', function() {
        it('should return the bookings attached to the spot', function() {
            var s = new Spot();
            var bookings = ['123','456']; 
            s.bookings = bookings;
            expect(s.getBookings()).to.deep.equal(bookings);
        });
        
        it('should return an empty array if no bookings are added', function() {
            var s = new Spot();
            var bookings = s.getBookings();
            expect(bookings).to.be.an.instanceOf(Array);
            expect(bookings).to.have.length(0);
        })
    })
    
    describe('addBookings', function() {
        it('should fail if range is already booked', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = new Date('2016/01/01');
            b.end = new Date('2016/01/04');
            var busy = new Date('2016/01/02');
            s.booked.addRange(b.start, busy);
            s.addBookings(b, function(err) {
                expect(err).to.be.ok;
                expect(s.booked.checkRange(b.start, busy)).to.be.true;
                expect(s.booked.checkRange(busy, b.end)).to.be.false;
                done();
            })
        })
        
        it('should remove availability', function(done) {
            var s = new Spot();
            var b = new Booking();
            var oneday = 1000*60*60*24;
            b.start = new Date('2016/01/02');
            b.end = new Date('2016/01/04');
            var pre = new Date(b.start.valueOf() - oneday),
                post = new Date(b.end.valueOf() + oneday);
            s.available.addRange(pre, post);
            s.addBookings(b, function(err) {
                expect(err).to.not.be.ok;
                expect(s.available.checkRange(pre, b.start)).to.be.true;
                expect(s.available.checkRange(pre, post)).to.be.false;
                expect(s.available.checkRange(b.end, post)).to.be.true;
                done();
            })
        })
        
        it('should update booking schedule', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = new Date('2016/01/01');
            b.end = new Date();
            s.available.addRange(b.start, b.end);
            s.addBookings(b, function(err) {
                expect(err).to.not.be.ok;
                expect(s.booked.checkRange(b.start, b.end)).to.be.true;
                done();
            })
        })
        
        it('should fail to add a booking that is already in the spot', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = b.end = new Date();
            s.bookings.push(b.id);
            s.addBookings(b, function(err) {
                expect(err).to.be.ok;
                expect(s.bookings).to.have.length(1);
                done();
            })
        })
        
        it('should fail if booking does not have a start time set', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.end = new Date();
            s.addBookings(b, function(err) {
                expect(err).to.be.ok;
                expect(s.bookings).to.have.length(0);
                done();
            })
        })
        
        it('should add a list of bookings to the array', function(done) {
            var s = new Spot();
            var bs = [new Booking(), new Booking(), new Booking()];
            bs.forEach(function(b) {
                b.start = b.end = new Date();
            })
            s.available.addRange(new Date(0), new Date());
            expect(s.bookings).to.have.length(0);
            s.addBookings(bs, function(err) {
                expect(err).to.not.be.ok;
                expect(s.bookings).to.have.length(bs.length);
                expect(s.bookings).to.include.all.members(bs.map(function(b) {
                    return b.id;
                }));
                done();
            })
            
        })
        
        it('should add a single booking to the array', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = b.end = new Date();
            s.available.addRange(new Date(0), new Date());
            expect(s.bookings).to.have.length(0);
            s.addBookings(b, function(err) {
                expect(err).to.not.be.ok;
                expect(s.bookings).to.have.length(1);
                expect(s.bookings).to.include(b.id);
                done();
            })
        })
        
        it('should fail if given bad input', function(done) {
            var s = new Spot();
            expect(s.bookings).to.have.length(0);
            [
                null,
                undefined,
                123,
                'abc',
                function(){expect.fail()},
            ].forEach(function(input, i, arr) {
                s.addBookings(input, function(err) {
                    expect(err, JSON.stringify(input)).to.be.ok;
                    expect(s.bookings).to.have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
            
        })
    })
    
    describe('removeBookings', function() {
        it('should clear booked time for spot', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = new Date('2016/01/01');
            b.end = new Date();
            s.booked.addRange(b.start, b.end);
            s.bookings.push(b.id);
            s.removeBookings(b, function(err) {
                expect(err).to.not.be.ok;
                expect(s.bookings).to.not.include(b.id);
                expect(s.booked.checkRange(b.start, b.end)).to.be.false;
                done();
            })
        })
        
        it('should return availability for spot', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = new Date('2016/01/01');
            b.end = new Date();
            s.booked.addRange(b.start, b.end);
            s.bookings.push(b.id);
            s.removeBookings(b, function(err) {
                expect(err).to.not.be.ok;
                expect(s.bookings).to.not.include(b.id);
                expect(s.available.checkRange(b.start, b.end)).to.be.true;
                done();
            })
        })
        
        it('should error if trying to remove a booking that is not in the spot', function(done) {
            var s = new Spot();
            s.removeBookings(new Booking(), function(err, success) {
                expect(err).to.be.ok;
                expect(err).to.have.length(1);
                expect(success).to.have.length(0);
                done();
            })
        })
        
        it('should return a success id array', function(done) {
            var s = new Spot();
            var booking = new Booking();
            s.bookings.push(booking.id);
            s.removeBookings(booking, function(err, success) {
                expect(s.bookings).to.have.length(0);
                expect(success).to.have.length(1);
                expect(success).deep.include(booking.id);
                done();
            })
        })
        
        it('should remove the given booking', function(done) {
            var s = new Spot();
            var booking = new Booking();
            s.bookings.push(booking.id);
            s.removeBookings(booking, function(err) {
                expect(s.bookings).to.have.length(0);
                done();
            })
        })
        
        it('should remove an array of bookings', function(done) {
            var s = new Spot();
            var bookings = [new Booking(), new Booking(), new Booking()]
            bookings.forEach(function(booking, i) {
                s.bookings.push(booking.id);
            })
            s.removeBookings(bookings, function(err) {
                expect(s.bookings).to.have.length(0);
                done();
            })
        })
        
        it('should error on bad type for each booking', function(done) {
            var s = new Spot();
            var b = new Booking();
            s.bookings.push(b.id);
            expect(s.bookings).to.have.length(1);
            expect(s.bookings).to.deep.include(b.id);
            [
                null, 
                undefined,
                123,
                'abc',
                function(){expect.fail()}
            ].forEach(function(input, i, arr) {
                s.removeBookings(input, function(err) {
                    expect(err, 'error').to.be.an.instanceOf(Array);
                    expect(err, 'error').to.have.length(1);
                    expect(s.bookings, 'bookings').to.have.length(1);
                    expect(s.bookings, 'bookings').to.deep.include(b.id);
                    if (i + 1 >= arr.length)
                        done();
                })
            })
        })
    })
    
    describe('setLot', function() {
        it('should error if invalid lot id', function(done) {
            var s = new Spot();
            [
                null,
                undefined,
                123,
                true
            ].forEach(function (input, i, arr) {
                expect(s.setLot(input, function(err) {
                    expect(err).to.be.ok;
                    expect(s.lot).to.not.be.ok;
                    if (i + 1 >= arr.length)
                        done();
                }));
            })
        })
        
        it('should set the lot id in the spot', function(done) {
            var s = new Spot();
            var id = '1z2x3c4v';
            s.setLot(id, function(err) {
                expect(err).to.not.be.ok;
                expect(s.lot).to.equal(id);
                done();
            })
        });
        
        it('should set the id of the given lot in the spot', function(done) {
            var s = new Spot();
            var l = new Lot();
            s.setLot(l, function(err) {
                expect(err).to.not.be.ok;
                expect(s.lot).to.equal(l.id);
                done();
            })
        });
    })
    
    describe('setNumber', function() {
        it('should fail if number is invalid', function(done) {
            var s = new Spot();
            [
                null,
                undefined,
                'abc',
                true
            ].forEach(function (input, i, arr) {
                expect(s.setNumber(input, function(err) {
                    expect(err).to.be.ok;
                    expect(s.number).to.not.be.ok;
                    if (i + 1 >= arr.length)
                        done();
                }));
            })
        })
        it('should set the lot number in the spot', function(done) {
            var s = new Spot();
            var n = 123;
            s.setNumber(n, function(err) {
                expect(err).to.not.be.ok;
                expect(s.number).to.equal(n);
                done();
            })
        })
    })
    
    describe('setLotAndNumber', function() {
        it('should set the lot id and number', function(done) {
            var s = new Spot();
            var l = new Lot();
            var n = 123;
            s.setLotAndNumber(l, n, function(err) {
                expect(err).to.not.be.ok;
                expect(s.lot).to.equal(l.id);
                expect(s.number).to.equal(n);
                done();
            })
        })
    })
    
    describe('getLot', function() {
        it('should return the lot id', function() {
            var s = new Spot();
            var id = '1z2x3c4v5b';
            s.lot = id;
            expect(s.getLot()).to.equal(id);
        })
    })
    
    describe('getNumber', function() {
        it('should return the spot\'s lot number', function() {
            var s = new Spot();
            var num = 123;
            s.number = num;
            expect(s.getNumber()).to.equal(num);
        })
    })
    
    describe('removeLot', function() {
        it('should remove lot', function(done) {
            var s = new Spot();
            s.lot = '1z2x3c4v';
            s.removeLot(function(err) {
                expect(err).to.not.be.ok;
                expect(s.lot).to.not.be.ok;
                done();
            })    
        })
    })
    
    describe('removeNumber', function() {
        it('should remove number', function(done) {
            var s = new Spot();
            s.number = 123;
            s.removeNumber(function(err) {
                expect(err).to.not.be.ok;
                expect(s.number).to.not.be.ok;
                done();
            })
        });
    })
    
    describe('addAvailability', function() {
        describe('should add the given recuring range to the availability', function() {
            it('given an rep count', function(done) {
                var s = new Spot();
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var count = 3;
                var oneday = 1000*60*60*24;
                s.addAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    count: count
                }, function(err) {
                    expect(err).to.not.be.ok;
                    expect(s.available.ranges).to.have.length(count * 2);
                    for (var i=0; i < count*2; i += oneday)
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    done();
                })
            })
            
            it('given a limit', function(done) {
                var s = new Spot();
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var finish = new Date('2016/01/07');
                var oneday = 1000*60*60*24;
                var count = 3;
                s.addAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    finish: finish    
                }, function(err) {
                    expect(err).to.not.be.ok;
                    expect(s.available.ranges).to.have.length(count * 2);
                    for (var i=0; i < count*2; i += oneday)
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    done();
                })
            })
            
        })
        
        it('should fail if given bad input', function(done) {
            var s = new Spot();
            [
                123,
                'abc',
                function(){expect.fail()},
                null,
                undefined,
                {},
                {start: 456},
                {start: function(){expect.fail()}, end: function(){expect.fail()}}
            ].forEach(function(input, i, arr) {
                s.addAvailability(input, function(err) {
                    expect(err).to.be.ok;
                    expect(s.available.ranges).to.have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should add the given time range object to the available array', function(done) {
            var s = new Spot();
            var start = new Date('2016/01/01');
            var end = new Date();
            expect(s.available.ranges).to.have.length(0);
            s.addAvailability({start: start, end: end}, function(err) {
                expect(err).to.not.be.ok;
                expect(s.available.ranges).to.have.length(2);
                expect(s.available.ranges).to.deep.include.all.members([start, end]);
                done();
            })
        })
    })
})

describe.only('spotController', function() {
    describe('route', function() {
        routeTest('spotController', [
            {
                verb: verbs.GET,
                route: '/api/spots',
                method: 'GetAllSpots',
                dbInjection: {
                    spots: {
                        find: sinon.spy(function(search, cb) {
                            expect(search).to.eql({});
                            cb(null, [{someProp:'some value'},{someProp:'some other value'}]);
                        })
                    }
                },
                sadDbInjection: {
                    spots: {
                        find: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: [{someProp:'some value'},{someProp:'some other value'}],
                ignoreId: true
            },
            {
                verb: verbs.PUT,
                route: '/api/spots',
                method: 'CreateSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true,
                ignoreId: true
            },
            {
                verb: verbs.GET,
                route: '/api/spots/:id',
                method: 'GetSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/spots/:id/location',
                method: 'GetLocationForSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.POST,
                route: '/api/spots/:id/location',
                method: 'SetLocationForSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/spots/:id/bookings',
                method: 'GetAllBookingsForSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/spots/:id/bookings',
                method: 'AdBookingsToSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.DELETE,
                route: '/api/spots/:id/bookings',
                method: 'RemoveBookingsFromSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/spots/:id/available',
                method: 'GetAllAvailabilityForSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/spots/:id/available',
                method: 'AdAvailabilityToSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.DELETE,
                route: '/api/spots/:id/available',
                method: 'RemoveAvailabilityFromSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/spots/:id/booked',
                method: 'GetAllBookedTimeForSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/spots/:id/schedule',
                method: 'GetEntireScheduleForSpot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            }
        ])
    })
})