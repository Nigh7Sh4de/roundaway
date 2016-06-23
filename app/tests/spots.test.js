var expect = require('chai').expect;
var sinon = require('sinon');
var expressExtensions = require('./../express');
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
    
    describe('setLocation', function() {
        it('should fail if no address is specified', function(done) {
            var s = new Spot();
            var coords = [123, 456];
            var address = '';
            expect(s.address).to.not.be.ok;
            s.setLocation(coords, address, function(err) {
                expect(err).to.be.ok;
                expect(s.address).to.not.be.ok;
                expect(s.location.address).to.not.be.ok;
                done();
            })
        })

        it('should set the address', function(done) {
            var s = new Spot();
            var coords = [123, 456];
            var address = 'some address';
            expect(s.address).to.not.be.ok;
            s.setLocation(coords, address, function(err) {
                expect(err).to.not.be.ok;
                expect(s.address).to.deep.equal(address);
                done();
            })
        })

        it('should set the location given an array', function(done) {
            var s = new Spot();
            var coords = [123, 456];
            expect(s.location.coordinates).to.not.be.ok;
            s.setLocation(coords, 'some address', function(err) {
                expect(err).to.not.be.ok;
                expect(s.location.coordinates).to.include.all.members(coords);
                done();
            })
        })
        
        it('should fail given a small array', function(done) {
            var s = new Spot();
            var coords = [123];
            expect(s.location.coordinates).to.not.be.ok;
            s.setLocation(coords, 'some address', function(err) {
                expect(err).to.be.ok;
                expect(s.location.coordinates).to.not.be.ok;
                done();
            })
        })
        
        it('should fail given a large array', function(done) {
            var s = new Spot();
            var coords = [123,456,789];
            expect(s.location.coordinates).to.not.be.ok;
            s.setLocation(coords, 'some address', function(err) {
                expect(err).to.be.ok;
                expect(s.location.coordinates).to.not.be.ok;
                done();
            })
        })
        
        it('should fail if array does not contain numbers', function(done) {
            var s = new Spot();
            expect(s.location.coordinates).to.not.be.ok;
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
                s.setLocation([input,input], 'some addres', function(err) {
                    expect(err).to.be.ok;
                    expect(s.location.coordinates).to.not.be.ok;
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
            expect(s.location.coordinates).to.not.be.ok;
            s.setLocation(coords, 'some address', function(err) {
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
            expect(s.location.coordinates).to.not.be.ok;
            s.setLocation(coords, 'some address', function(err) {
                expect(err).to.not.be.ok;
                expect(s.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
        
        it('should fail if not given good input', function(done) {
            var s = new Spot();
            expect(s.location.coordinates).to.not.be.ok;
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
                s.setLocation(input, 'some addres', function(err) {
                    expect(err).to.be.ok;
                    expect(s.location.coordinates).to.not.be.ok;
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should fail if object does not have long lat props', function(done) {
            var s = new Spot();
            expect(s.location.coordinates).to.not.be.ok;
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
                s.setLocation({long:input,lat:input}, 'some addres', function(err) {
                    expect(err).to.be.ok;
                    expect(s.location.coordinates).to.not.be.ok;
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
            expect(s.location.coordinates).to.not.be.ok;
            s.setLocation(coords, 'some address', function(err) {
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
            expect(s.location.coordinates).to.not.be.ok;
            s.setLocation(coords, 'some address', function(err) {
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
            expect(s.getBookings()).to.deep.include.all.members(bookings);
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
        it('should be able to parse string', function(done) {
            var start = '2010/01/01';
            var end = '2016/01/01';
            var s = new Spot();
            s.addAvailability({start: start, end: end}, function(err) {
                expect(err).to.not.be.ok;
                expect(s.available.check(new Date(start))).to.be.true;
                expect(s.available.check(new Date(end))).to.be.false;
                done();
            })
        })
        
        describe('should add the given recuring range to the availability', function() {
            it('given an rep count', function(done) {
                var s = new Spot();
                s.save = function(cb){cb(null)}
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
                    expect(s.available.ranges).to.have.length(count);
                    for (var i=0; i < count*2; i += 2)
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    done();
                })
            })
            
            it('given a limit', function(done) {
                var s = new Spot();
                s.save = function(cb){cb(null)}
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
                    expect(s.available.ranges).to.have.length(count);
                    for (var i=0; i < count*2; i += 2)
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
            var end = new Date('2016/02/01');
            expect(s.available.check(new Date('2015/01/15'))).to.be.false;
            expect(s.available.check(new Date('2016/01/15'))).to.be.false;
            expect(s.available.check(new Date('2017/01/15'))).to.be.false;
            s.addAvailability({start: start, end: end}, function(err) {
                expect(err).to.not.be.ok;
                expect(s.available.check(new Date('2015/01/15'))).to.be.false;
                expect(s.available.check(new Date('2016/01/15'))).to.be.true;
                expect(s.available.check(new Date('2017/01/15'))).to.be.false;
                done();
            })
        })
    })
    
    describe('removeAvailability', function() {
        it('should be able to parse string', function(done) {
            var start = '2010/01/01';
            var end = '2016/01/01';
            var s = new Spot();
            s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
            s.removeAvailability({start: start, end: end}, function(err) {
                expect(err).to.not.be.ok;
                expect(s.available.check(new Date(start))).to.be.false;
                expect(s.available.check(new Date(end))).to.be.true;
                done();
            })
        })
        
        describe('should remove the given recuring range from the availability', function() {
            it('given an rep count', function(done) {
                var s = new Spot();
                s.save = function(cb){cb(null)}
                s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var count = 3;
                var oneday = 1000*60*60*24;
                s.removeAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    count: count
                }, function(err) {
                    expect(err).to.not.be.ok;
                    expect(s.available.ranges).to.have.length(count + 1);
                    for (var i=1; i < count*2; i += 2) {
                        expect(s.available.check(new Date('2016/01/' + (i)))).to.be.false;
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    }
                    done();
                })
            })
            
            it('given a limit', function(done) {
                var s = new Spot();
                s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var finish = new Date('2016/01/07');
                var oneday = 1000*60*60*24;
                var count = 3;
                s.removeAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    finish: finish    
                }, function(err) {
                    expect(err).to.not.be.ok;
                    expect(s.available.ranges).to.have.length(count + 1);
                    for (var i=1; i < count*2; i += 2) {
                        expect(s.available.check(new Date('2016/01/' + (i)))).to.be.false;
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    }
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
                s.removeAvailability(input, function(err) {
                    expect(err).to.be.ok;
                    expect(s.available.ranges).to.have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should remove the given time range object from the available array', function(done) {
            var s = new Spot();
            s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
            var start = new Date('2016/01/01');
            var end = new Date('2016/02/01');
                expect(s.available.check(new Date('2015/01/15'))).to.be.true;
                expect(s.available.check(new Date('2016/01/15'))).to.be.true;
                expect(s.available.check(new Date('2017/01/15'))).to.be.true;
            s.removeAvailability({start: start, end: end}, function(err) {
                expect(err).to.not.be.ok;
                expect(s.available.check(new Date('2015/01/15'))).to.be.true;
                expect(s.available.check(new Date('2016/01/15'))).to.be.false;
                expect(s.available.check(new Date('2017/01/15'))).to.be.true;
                done();
            })
        })
    })

    describe.only('getPrice', function() {
        it('should return the price', function() {
            var price = 123.45;
            var s = new Spot();
            s.price.perHour = price;
            expect(s.getPrice().perHour).to.equal(price);
        })

        it('should return null if price is not set', function() {
            var s = new Spot();
            expect(s.getPrice()).to.be.ok;
            expect(s.getPrice().perHour).to.not.be.ok;
        })
    })
})

routeTest('spotController', [
        {
            verb: verbs.GET,
            route: '/api/spots',
            method: 'GetAllSpots',
            ignoreId: true
        },
        {
            verb: verbs.PUT,
            route: '/api/spots',
            method: 'CreateSpot',
            ignoreId: true
        },
        {
            verb: verbs.GET,
            route: '/api/spots/near',
            method: 'GetNearestSpot',
            ignoreId: true
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id',
            method: 'GetSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/location',
            method: 'GetLocationForSpot'
        },
        {
            verb: verbs.POST,
            route: '/api/spots/:id/location',
            method: 'SetLocationForSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/bookings',
            method: 'GetAllBookingsForSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/bookings',
            method: 'AddBookingsToSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/bookings/remove',
            method: 'RemoveBookingsFromSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/available',
            method: 'GetAllAvailabilityForSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/available',
            method: 'AddAvailabilityToSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/available/remove',
            method: 'RemoveAvailabilityFromSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/booked',
            method: 'GetAllBookedTimeForSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/schedule',
            method: 'GetEntireScheduleForSpot'
        }
    ])

describe('spotController', function() {
    var app,
        req = {},
        res = {};
    
    beforeEach(function() {
        var inject = server.GetDefaultInjection();
        // inject.passport = function(){
        //     return {
        //         initialize: function(){
        //             return function(){}
        //         },
        //         session: function(){
        //             return function(){}
        //         }
        //     }
        // };
        // inject.authController = function(){};
        app = server(inject);
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })
    
    describe('GetAllSpots', function() {
        it('should return all spots', function() {
            var spots = [new Spot(), new Spot()];
            app.db.spots = {
                find: function(obj, cb) {
                    cb(null, spots);
                }
            }
            app.spotController.GetAllSpots(null, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({spots: spots})).to.be.true;
        })
    })
    
    describe('GetSpot', function() {
        it('should get spot with specified id', function() {
            var spot = new Spot();
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(spot.id);
                    cb(null, spot);
                }
            }
            req.params.id = spot.id;
            app.spotController.GetSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({spot: spot})).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.GetSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.GetSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('CreateSpot', function() {
        var emptySpot;
        
        before(function() {
            emptySpot = new Spot().toJSON();
            delete emptySpot._id;    
        })
        
        it('should send error if req count is invalid (and not null)', function() {
            [
                'abc',
                {},
                function(){expect.fail()},
                []
            ].forEach(function(input) {
                req.body.count = input;
                app.spotController.CreateSpot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                res.status.reset();
                res.send.reset();
            })
        })
        
        it('if couldnt create spot should send error', function() {
            app.db.spots = {
                create: function(obj, cb) {
                    cb('some error');
                }
            }
            app.spotController.CreateSpot(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
        })
        
        it('if couldnt insert entire collection should send error', function() {
            app.db.spots = {
                collection: {
                    insert: function(obj, cb) {
                        cb('some error');
                    }
                }
            }
            req.body.count = 5;
            app.spotController.CreateSpot(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
        })
        
        it('should create n spots with the given props', function() {
            var count = 5;
            var spot = Object.assign({}, emptySpot);
            var arr = [];
            for (var i=0;i<count;i++)
                arr.push(spot);
            spot.address = '123 fake st';
            app.db.spots = {
                collection: {
                    insert: function(obj, cb) {
                        expect(obj).to.have.length(count);
                        expect(obj[0]).to.have.property('address');
                        expect(obj).to.deep.include.all.members(arr);
                        cb(null, obj);
                    }
                }
            }
            req.body.count = count;
            req.body.spot = spot;
            app.spotController.CreateSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
        
        it('should create a spot with the given props', function() {
            var spot = Object.assign({}, emptySpot);
            spot.address = '123 fake st';
            app.db.spots = {
                create: function(obj, cb) {
                    expect(obj).to.have.property('address');
                    cb(null, obj);
                }
            }
            req.body.spot = spot;
            app.spotController.CreateSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
        
        it('should create a blank spot given no params', function() {
            app.db.spots = {
                create: function(obj, cb) {
                    expect(obj).to.deep.equal(emptySpot);
                    cb(null, obj);
                }
            }
            app.spotController.CreateSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
        
        it('should create n blank spots given a count n', function() {
            var count = 5;
            var arr = [];
            for (var i=0;i<count;i++)
                arr.push(emptySpot);
            app.db.spots = {
                collection: {
                    insert: sinon.spy(function(obj, cb) {
                        expect(obj).to.have.length(count);
                        expect(obj).to.deep.include.all.members(arr);
                        cb(null, obj);
                    })
                }
            }
            req.body.count = count;
            app.spotController.CreateSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].status).to.equal('SUCCESS');
        })
    })
    
    describe('GetNearestSpot', function() {
        it('should return nearest AVAILABLE spots', function() {
            var spots = [new Spot(), new Spot];
            var limitedSpots = spots.slice(0, 1);
            var long = 12;
            var lat = 21;
            var find = function(cb) { 
                cb(null, spots); 
            };
            var fakeQueryObject = function() {
                this.limit = function() { return this; }
                this.elemMatch = function() {
                    spots.splice(1, 1); 
                    return this; 
                }
                this.exec = find;
                return this;
            }
            app.db.spots = {
                find: fakeQueryObject
            }
            req.query = {
                long: long,
                lat: lat,
                available: new Date()
            }
            app.spotController.GetNearestSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({spots: limitedSpots})).to.be.true;
        })
        
        it('should return nearest COUNT spots', function() {
            var spots = [new Spot(), new Spot];
            var limitedSpots = spots.slice(0, 1);
            var long = 12;
            var lat = 21;
            var find = function(cb) { 
                cb(null, spots); 
            };
            var fakeQueryObject = function() {
                this.limit = function() {
                    spots.splice(1, 1); 
                    return this; 
                }
                this.exec = find;
                return this;
            }
            app.db.spots = {
                find: fakeQueryObject
            }
            req.query = {
                long: long,
                lat: lat,
                count: 1
            }
            app.spotController.GetNearestSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({spots: limitedSpots})).to.be.true;
        })
        
        it('should return nearest spots', function() {
            var spots = [new Spot()];
            var long = 12;
            var lat = 21;
            var find = sinon.spy(function(cb) { cb(null, spots); });
            var fakeQueryObject = function() {
                this.limit = function() { return this; }
                this.exec = find;
                return this;
            }
            app.db.spots = {
                find: fakeQueryObject
            }
            req.query = {
                long: long,
                lat: lat
            }
            app.spotController.GetNearestSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({spots: spots})).to.be.true;
        })
        
        it('should error if long and lat are not specified', function() {
            app.spotController.GetNearestSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            req.query.long = req.query.lat = 123;
            var find = sinon.spy(function(cb) { cb('some error'); });
            var fakeQueryObject = function() {
                this.limit = function() { return this; }
                this.exec = find;
                return this;
            }
            app.db.spots = {
                find: fakeQueryObject
            }
            app.spotController.GetNearestSpot(req, res);
            expect(find.calledOnce).to.be.true;
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('GetLocationForSpot', function() {
        it('should return the spot\'s location', function() {
            var s = new Spot();
            s.address = '123 fake st';
            s.location.coordinates = [123, 456];
            var expected = {
                address: s.getAddress(),
                coordinates: s.getLocation()
            }
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            app.spotController.GetLocationForSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({location: expected}), JSON.stringify(res.send.firstCall.args[0]) + '\n' + JSON.stringify(expected)).to.be.true;
        });
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.GetLocationForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.GetLocationForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('SetLocationForSpot', function() {
        var s = new Spot();
        var coords = {
            long: 123,
            lat: 456
        };
        var address = '123 fake st';
        
        beforeEach(function() {
            s = new Spot();
            sinon.stub(s, 'setLocation', function(l,a,cb) {
                cb();
            })
            // sinon.stub(s, 'setAddress', function(l,cb) {
            //     cb();
            // })
            sinon.stub(app.geocoder, 'reverse', function(opt, cb) {
                expect(opt.lat).to.equal(coords.lat);
                expect(opt.lon).to.equal(coords.long);
                cb(null, [{formattedAddress: address}]);
            })
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
        })
        
        it('should set location given coordinates as array', function(done) {
            req.body = {
                coordinates: [coords.long, coords.lat]
            }
            res.sent = function(status) {
                expect(s.setLocation.calledOnce).to.be.true;
                expect(s.setLocation.calledWith({lat:coords.lat,lon:coords.long}, address)).to.be.true;
                done();
            }
            app.spotController.SetLocationForSpot(req, res);
        })
        
        it('should set location given long and lat as object', function(done) {
            req.body = {
                coordinates: {
                    long: coords.long,
                    lat: coords.lat
                }
            }
            res.sent = function() {
                expect(s.setLocation.calledOnce).to.be.true;
                expect(s.setLocation.calledWith({lat:coords.lat,lon:coords.long}, address)).to.be.true;
                done();
            }
            app.spotController.SetLocationForSpot(req, res);
        })
        
        it('should fail if no coordinates object in body', function() {
            app.spotController.SetLocationForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('GetAllBookingsForSpot', function() {
        it('should return an empty array if no bookings are assigned', function(done) {
            var s = new Spot();
            app.db.spots = {
                findById: function(id,cb) {
                    return cb(null, s);
                }
            }
            res.sent = function(body) {
                expect(res.sentWith({bookings: []}))
                done();
            }
            req.params.id = s.id;
            app.spotController.GetAllBookingsForSpot(req, res);
        })
        
        
        it('should return the spot\'s bookings', function() {
            var s = new Spot();
            var expected = [
                new Booking(),
                new Booking()
            ]
            s.bookings = [expected[0].id, expected[1].id];
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            app.db.bookings = {
                findById: function(id, cb) {
                    for(var i=0;i<expected.length;i++)
                        if (expected[i].id == id)
                            return cb(null, expected[i]);
                    return cb('Booking not found');
                }
            }
            req.params.id = s.id;
            app.spotController.GetAllBookingsForSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(expected)).to.be.true;
        });
        
        it('should return the spot\'s bookings and error messages for failures', function() {
            var s = new Spot();
            var msg = 'Booking not found';
            var expected = [
                new Booking(),
                msg
            ]
            s.bookings = [expected[0].id, '123'];
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            app.db.bookings = {
                findById: function(id, cb) {
                    if (expected[0].id == id)
                        return cb(null, expected[0]);
                    return cb(msg);
                }
            }
            req.params.id = s.id;
            app.spotController.GetAllBookingsForSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.firstCall.args[0].data).to.have.length(1);
            expect(res.send.firstCall.args[0].data).to.deep.include(expected[0]);
            expect(res.send.firstCall.args[0].errors).to.have.length(1);
        });
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.GetAllBookingsForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.GetAllBookingsForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('AddBookingsToSpot', function() {
        it('should update booking object being added', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.setSpot = sinon.spy(function(spot, cb) {
                cb(null);
            });
            b.start = b.end = new Date();
            sinon.stub(s, 'addBookings', function(_b, cb) {
                expect(_b).to.deep.include(b);
                cb(null);
            })
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            req.body.bookings = b;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(b.setSpot.calledOnce).to.be.true;
                done();
            }
            app.spotController.AddBookingsToSpot(req, res);
        })

        it('should add the given booking objects arr', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.setSpot = function(spot, cb) { cb() }
            b.start = b.end = new Date();
            sinon.stub(s, 'addBookings', function(_b, cb) {
                expect(_b).to.deep.include(b);
                cb(null);
            })
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            req.body.bookings = b;
            res.sent = function(status) {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.AddBookingsToSpot(req, res);
        })
        
        it('should find and add the given booking ids', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.setSpot = function(spot, cb) { cb() }
            b.start = b.end = new Date();
            sinon.stub(s, 'addBookings', function(_b, cb) {
                expect(_b).to.deep.include(b);
                cb(null);
            })
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            app.db.bookings = {
                find: function(search, cb) {
                    expect(search._id.$in).to.deep.include(b._id.toString());
                    cb(null, [b]);
                }
            }
            req.params.id = s.id;
            req.body.bookings = b.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.AddBookingsToSpot(req, res);
        })
        
        it('should fail if addBookings failed', function(done) {
            var s = new Spot();
            sinon.stub(s, 'addBookings', function(b, cb) {
                cb('some error');
            });
            req.body.bookings = new Booking();
            res.send = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                done();
            };
            app.spotController.AddBookingsToSpot(req, res);
        })
        
        it('should fail if given bad input', function(done) {
            [
                null,
                undefined,
                123,
                function(){expect.fail()},
                {badProp: 'bad value'}
            ].forEach(function(input, i, arr) {
                req.body.bookings = input;
                app.spotController.AddBookingsToSpot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                res.status.reset();
                res.send.reset();
                if (i+1 >= arr.length)
                    done();
            })
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.AddBookingsToSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.AddBookingsToSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('RemoveBookingsFromSpot', function() {
        it('should remove the given booking objects arr', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = b.end = new Date();
            sinon.stub(s, 'removeBookings', function(_b, cb) {
                expect(_b).to.deep.include(b);
                cb(null);
            })
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            req.body.bookings = b;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.RemoveBookingsFromSpot(req, res);
        })
        
        it('should find and remove the given booking ids', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = b.end = new Date();
            sinon.stub(s, 'removeBookings', function(_b, cb) {
                expect(_b).to.deep.include(b);
                cb(null);
            })
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            app.db.bookings = {
                find: function(search, cb) {
                    expect(search._id.$in).to.deep.include(b._id.toString());
                    cb(null, [b]);
                }
            }
            req.params.id = s.id;
            req.body.bookings = b.id;
            res.sent = function(status) {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.RemoveBookingsFromSpot(req, res);
        })
        
        it('should fail if removeBookings failed', function(done) {
            var s = new Spot();
            sinon.stub(s, 'removeBookings', function(b, cb) {
                cb('some error');
            });
            req.body.bookings = new Booking();
            res.send = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                done();
            };
            app.spotController.RemoveBookingsFromSpot(req, res);
        })
        
        it('should fail if given bad input', function(done) {
            [
                null,
                undefined,
                123,
                function(){expect.fail()},
                {badProp: 'bad value'}
            ].forEach(function(input, i, arr) {
                req.body.bookings = input;
                app.spotController.RemoveBookingsFromSpot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                res.status.reset();
                res.send.reset();
                if (i+1 >= arr.length)
                    done();
            })
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.RemoveBookingsFromSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.RemoveBookingsFromSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('GetAllAvailabilityForSpot', function() {
        it('should return the available ranges for the spot', function() {
            var s = new Spot();
            s.available.addRange(new Date('2016/01/01'), new Date());
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            app.spotController.GetAllAvailabilityForSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({available: s.available.ranges})).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.GetAllAvailabilityForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.GetAllAvailabilityForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('AddAvailabilityToSpot', function() {
        it('should add the entire request body as a schedule if no shedules are specified', function() {
            var s = new Spot();
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            var schedule = {someProp: 'somevalue'};
            sinon.stub(s, 'addAvailability', function(sched, cb) {
                expect(sched).to.equal(schedule);
                cb(null);
            })
            req.params.id = s.id;
            req.body = schedule;
            app.spotController.AddAvailabilityToSpot(req, res);
            expect(res.sendGood.calledOnce).to.be.true;
        })
        it('should add the given schedules to the spot\'s availability', function() {
            var s = new Spot();
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            var schedules = [{someProp: 'somevalue'}];
            sinon.stub(s, 'addAvailability', function(sched, cb) {
                expect(sched).to.equal(schedules);
                cb(null);
            })
            req.params.id = s.id;
            req.body.schedules = schedules;
            app.spotController.AddAvailabilityToSpot(req, res);
            expect(res.sendGood.calledOnce).to.be.true;
        })
        
        it('should fail if addAvailability failed', function() {
            var s = new Spot();
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            var schedules = [{someProp: 'somevalue'}];
            var error = 'some error';
            sinon.stub(s, 'addAvailability', function(sched, cb) {
                expect(sched).to.equal(schedules);
                cb(error);
            })
            req.params.id = s.id;
            req.body.schedules = schedules;
            app.spotController.AddAvailabilityToSpot(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
            expect(res.sentWith({errors: [error]}, true)).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.AddAvailabilityToSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.AddAvailabilityToSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('RemoveAvailabilityFromSpot', function() {
        it('should remove the entire request body as a schedule if no shedules are specified', function() {
            var s = new Spot();
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            var schedule = {someProp: 'somevalue'};
            sinon.stub(s, 'removeAvailability', function(sched, cb) {
                expect(sched).to.equal(schedule);
                cb(null);
            })
            req.params.id = s.id;
            req.body = schedule;
            app.spotController.RemoveAvailabilityFromSpot(req, res);
            expect(res.sendGood.calledOnce).to.be.true;
        })
        it('should remove the given schedules to the spot\'s availability', function() {
            var s = new Spot();
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            var schedules = [{someProp: 'somevalue'}];
            sinon.stub(s, 'removeAvailability', function(sched, cb) {
                expect(sched).to.equal(schedules);
                cb(null);
            })
            req.params.id = s.id;
            req.body.schedules = schedules;
            app.spotController.RemoveAvailabilityFromSpot(req, res);
            expect(res.sendGood.calledOnce).to.be.true;
        })
        
        it('should fail if removeAvailability failed', function() {
            var s = new Spot();
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            var schedules = [{someProp: 'somevalue'}];
            var error = 'some error';
            sinon.stub(s, 'removeAvailability', function(sched, cb) {
                expect(sched).to.equal(schedules);
                cb(error);
            })
            req.params.id = s.id;
            req.body.schedules = schedules;
            app.spotController.RemoveAvailabilityFromSpot(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
            expect(res.sentWith({errors: [error]}));
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.RemoveAvailabilityFromSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.RemoveAvailabilityFromSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('GetAllBookedTimeForSpot', function() {
        it('should return the available ranges for the spot', function() {
            var s = new Spot();
            s.booked.addRange(new Date('2016/01/01'), new Date());
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            app.spotController.GetAllBookedTimeForSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({booked: s.booked.ranges})).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.GetAllBookedTimeForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.GetAllBookedTimeForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
    
    describe('GetEntireScheduleForSpot', function() {
        it('should return the available ranges for the spot', function() {
            var s = new Spot();
            s.booked.addRange(new Date('2016/01/01'), new Date());
            s.available.addRange(new Date('2016/01/01'), new Date());
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            app.spotController.GetEntireScheduleForSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({
                    booked: s.booked.ranges,
                    available: s.available.ranges
                })).to.be.true;
        })
        
        it('should error if db encountered error', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb('some error');
                }
            }
            app.spotController.GetEntireScheduleForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
        
        it('should return error if spot found is null', function() {
            app.db.spots = {
                findById: function(id, cb) {
                    cb(null, null);
                }
            }
            app.spotController.GetEntireScheduleForSpot(req, res);
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.send.calledOnce).to.be.true;
        })
    })
})