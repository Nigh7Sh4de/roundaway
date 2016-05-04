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
        sinon.stub(Spot.prototype, 'save', function(cb) { cb(null, this) });
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
        it.only('should update booking schedule', function(done) {
            var s = new Spot();
            var b = new Booking();
            var now = new Date();
            now.setMilliseconds(0);
            b.start = new Date(now.toDateString());
            b.duration = now - b.start;
            s.addBookings(b, function(err) {
                expect(s.bookings).to.include(b.id);
                var sched = later.schedule(s.booked).nextRange(1, b.start);
                expect(sched).to.be.an.instanceOf(Array);
                expect(sched[1]).to.be.at.least(new Date(b.start.valueOf() + b.duration));
                done();
            })
        })
        
        it('should fail to add a booking that is already in the spot', function(done) {
            var s = new Spot();
            var b = new Booking();
            s.bookings.push(b.id);
            s.addBookings(b, function(err) {
                expect(err).to.be.ok;
                expect(err).to.have.length(1);
                expect(s.bookings).to.have.length(1);
                done();
            })
        })
        
        it('should add a list of bookings to the array', function(done) {
            var bookings = [new Booking(), new Booking()];
            bookings.forEach(function(b) {
                b.start = new Date(),
                b.duration = 123
            });
            var s = new Spot();
            expect(s.bookings).to.have.length(0);
            s.addBookings(bookings, function(err) {
                expect(err).to.not.be.ok;
                expect(s.bookings).to.have.length(bookings.length);
                bookings.forEach(function(booking) {
                    expect(s.bookings).to.include(booking.id);
                })
                done();
            });
        })
        
        it('should add a single booking to the array', function(done) {
            var booking = new Booking();
            booking.start = new Date(),
            booking.duration = 123
            var s = new Spot();
            expect(s.bookings).to.have.length(0);
            s.addBookings(booking, function(err) {
                expect(err).to.not.be.ok;
                expect(s.bookings).to.have.length(1);
                expect(s.bookings).to.include(booking.id);
                done();
            });
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
                    expect(err).to.be.ok;
                    expect(s.bookings).to.have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
            
        })
    })
    
    describe('removeBookings', function() {
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
    
    describe('addAvailable', function() {
        it('should fail if given an invalid schedule', function(done) {
            var s = new Spot();
            var b = {};
            expect(s.available.schedules).to.have.length(0);
            s.addAvailable(b, function(err) {
                expect(err).to.be.ok;
                expect(s.available.schedules).to.have.length(0);
                done();
            })
        })
        it('should add the given sched to the available laterjs', function(done) {
            var s = new Spot();
            var b = { h: [1] };
            expect(s.available.schedules).to.have.length(0);
            s.addAvailable(b, function(err) {
                expect(err).to.not.be.ok;
                expect(s.available.schedules).to.have.length(1);
                expect(s.available.schedules).to.deep.include(b);
                done();
            })
        })
    })
    
})