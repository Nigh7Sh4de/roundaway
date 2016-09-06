var expect = require('chai').expect;
var ObjectId = require('mongoose').Types.ObjectId;
var sinon = require('sinon');
var Errors = require('./../errors');
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var mockPromise = require('./mockPromise');
var verbs = routeTest.verbs;
var server = require('./../../server');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');
var Booking = require('./../models/Booking');
var User = require('./../models/User');

describe('Spot schema', function() {
    before(function() {
        sinon.stub(Spot.prototype, 'save', function(cb) { cb() });
    })
    
    after(function() {
        Spot.prototype.save.restore();
    })

    describe('setName', function() {
        it('should set the name of the spot', function() {
            var s = new Spot();
            var name = 'some name';
            expect(s.name).to.not.be.ok;
            return s.setName(name)
            .then(function() {
                expect(s.name).to.deep.equal(name);
            })
        })
    })

    describe('getName', function() {
        it('should get the name of the spot', function() {
            var s = new Spot();
            var name = 'some name';
            s.name = name;
            expect(s.getName()).to.deep.equal(name);
        })
    })

    describe('addBookings', function() {
        it('should fail if not available', function() {
            var s = new Spot();
            var b = new Booking();
            b.start = new Date('2010/01/01');
            b.end = new Date('2010/01/02');
            expect(s.booked.checkRange(b.start, b.end)).to.be.false;
            return s.addBookings(b).then(function(spot) {
                expect.fail();
            }).catch(function(err) {
                expect(s.booked.checkRange(b.start, b.end)).to.be.false;
            })
        })

        it('should add to the booked schedule', function() {
            var s = new Spot();
            s.available.addRange(new Date('2000/01/01'), new Date('2100/01/01'));
            var b = new Booking();
            b.start = new Date('2010/01/01');
            b.end = new Date('2010/01/02');
            expect(s.booked.checkRange(b.start, b.end)).to.be.false;
            return s.addBookings(b).then(function(spot) {
                expect(s.booked.checkRange(b.start, b.end)).to.be.true;
            })
        })

        it('should remove from the available schedule', function() {
            var s = new Spot();
            s.available.addRange(new Date('2000/01/01'), new Date('2100/01/01'));
            var b = new Booking();
            b.start = new Date('2010/01/01');
            b.end = new Date('2010/01/02');
            expect(s.available.checkRange(b.start, b.end)).to.be.true;
            return s.addBookings(b).then(function(spot) {
                expect(s.available.checkRange(b.start, b.end)).to.be.false;
            })
        })
    })

    describe('removeBookings', function() {
        it('should clear booked time for spot', function() {
            var s = new Spot();
            var b = new Booking({
                spot: s,
                start: new Date('2016/01/01'),
                end: new Date()
            });
            s.booked.addRange(b.start, b.end);
            expect(s.booked.checkRange(b.start, b.end)).to.be.true;
            return s.removeBookings(b).then(function(booking) {
                expect(s.booked.checkRange(b.start, b.end)).to.be.false;
            })
        })
        
        it('should return availability for spot', function() {
            var s = new Spot();
            var b = new Booking({
                spot: s,
                start: new Date('2016/01/01'),
                end: new Date()
            });
            s.booked.addRange(b.start, b.end);
            expect(s.available.checkRange(b.start, b.end)).to.be.false;
            return s.removeBookings(b).then(function(booking) {
                expect(s.available.checkRange(b.start, b.end)).to.be.true;
            })
        })
        
        it('should error if trying to remove a booking that is not associated with the spot', function() {
            var s = new Spot();
            var b = new Booking({
                start: new Date('2016/01/01'),
                end: new Date()
            });
            return s.removeBookings(b).then(function(booking) {
                expect.fail();
            }).catch(function(err) {
                expect(err).to.be.ok;

            })
        })
        
        it('should remove an array of bookings', function() {
            var s = new Spot();
            var _b = {
                spot: s,
                start: new Date('2016/01/01'),
                end: new Date()
            };
            var bs = [new Booking({
                spot: s,
                start: new Date('2016/01/01'),
                end: new Date('2016/01/02')
            }), new Booking({
                spot: s,
                start: new Date('2016/02/01'),
                end: new Date('2016/02/02')
            })];
            return s.removeBookings(bs).then(function(booking) {
                expect(s.available.checkRange(bs[0].start, bs[0].end)).to.be.true;
                expect(s.available.checkRange(bs[0].end, bs[1].start)).to.be.false;
                expect(s.available.checkRange(bs[1].start, bs[1].end)).to.be.true;
            })
        })
        
        it('should error on bad type for each booking', function() {
            var s = new Spot();
            expect(s.available.ranges).to.have.length(0);
            
            var tests = 0;
            [
                null, 
                undefined,
                123,
                'abc',
                function(){expect.fail()}
            ].forEach(function(input, i, arr) {
                s.removeBookings(input)
                .then(function() {
                    done(input || 'empty');
                })
                .catch(function(err) {
                    expect(s.available.ranges).to.have.length(0);
                    if (++test >= arr.length)
                        done();
                })
            });
        })
    })
    
    describe('getAddress', function() {
        it('should return the address of the spot', function() {
            var s = new Spot();
            var address = '123 some st'; 
            s.location.address = address;
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
        it('should fail if no address is specified', function() {
            var s = new Spot();
            var coords = [123, 456];
            var address = '';
            expect(s.location.address).to.not.be.ok;
            return s.setLocation(coords, address)
            .then(function(location) {
                expect.fail();
            })
            .catch(function(err) {
                expect(s.location.address).to.not.be.ok;
            })
        })

        it('should set the address', function() {
            var s = new Spot();
            var coords = [123, 456];
            var address = 'some address';
            expect(s.location.address).to.not.be.ok;
            return s.setLocation(coords, address)
            .then(function(location) {
                expect(s.location.address).to.deep.equal(address);
            })
        })

        it('should set the location given an array', function() {
            var s = new Spot();
            var coords = [123, 456];
            expect(s.location.coordinates).to.not.be.ok;
            return s.setLocation(coords, 'some address')
            .then(function(location) {
                expect(s.location.coordinates).to.include.all.members(coords);
            })
        })
        
        it('should fail given a small array', function() {
            var s = new Spot();
            var coords = [123];
            expect(s.location.coordinates).to.not.be.ok;
            return s.setLocation(coords, 'some address')
            .then(function(location) {
                expect.fail();
            })
            .catch(function(err) {
                expect(s.location.address).to.not.be.ok;
            })
        })
        
        it('should fail given a large array', function() {
            var s = new Spot();
            var coords = [123,456,789];
            expect(s.location.coordinates).to.not.be.ok;
            return s.setLocation(coords, 'some address')
            .then(function(location) {
                expect.fail();
            })
            .catch(function(err) {
                expect(s.location.address).to.not.be.ok;
            })
        })
        
        it('should fail if array does not contain numbers', function() {
            var s = new Spot();
            expect(s.location.coordinates).to.not.be.ok;
            var tests = 0;
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
                s.setLocation([input,input], 'some addres')
                .then(function(location) {
                    expect.fail();
                })
                .catch(function(err) {
                    expect(s.location.coordinates).to.not.be.ok;
                        if (++test >= arr.length)
                            done();
                })
            });
        })
        
        it('should parse strings into numbers for arrays', function() {
            var s = new Spot();
            var coords_g = '123';
            var coords_t = '456';
            var coords = [coords_g, coords_t];
            expect(s.location.coordinates).to.not.be.ok;
            return s.setLocation(coords, 'some address')
            .then(function(location) {
                expect(s.location.coordinates).to.include.all.members(coords);
            })
        })
        
        it('should set the location given an object', function() {
            var s = new Spot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = {
                long: coords_g,
                lat: coords_t
            };
            expect(s.location.coordinates).to.not.be.ok;
            return s.setLocation(coords, 'some address')
            .then(function(location) {
                expect(s.location.coordinates).to.include.all.members([coords_g,coords_t]);
            })
        })
        
        it('should fail if not given good input', function() {
            var s = new Spot();
            expect(s.location.coordinates).to.not.be.ok;
            var tests = 0;
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
                s.setLocation(input, 'some addres')
                .then(function(location) {
                    done(input || 'empty')
                })
                .catch(function(err) {
                    expect(s.location.address).to.not.be.ok;
                    if (++test >= arr.length)
                        done();
                })
            });
        })
        
        it('should fail if object does not have long lat props', function() {
            var s = new Spot();
            expect(s.location.coordinates).to.not.be.ok;
            var tests = 0;
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
                s.setLocation({long:input,lat:input}, 'some addres')
                .then(function(location) {
                    expect.fail();
                })
                .catch(function(err) {
                    expect(s.location.address).to.not.be.ok;
                    if (++test >= arr.length)
                        done();
                })
            })
        })
        
        it('should accept lon as long prop', function() {
            var s = new Spot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = {
                lon: coords_g,
                lat: coords_t
            };
            expect(s.location.coordinates).to.not.be.ok;
            return s.setLocation(coords, 'some address')
            .then(function(location) {
                expect(s.location.coordinates).to.include.all.members([coords_g,coords_t]);
            })
        })
        
        it('should parse strings into numbers for objects', function() {
            var s = new Spot();
            var coords_g = '123';
            var coords_t = '456';
            var coords = {
                long: coords_g,
                lat: coords_t
            };
            expect(s.location.coordinates).to.not.be.ok;
            return s.setLocation(coords, 'some address')
            .then(function(location) {
                expect(s.location.coordinates).to.include.all.members([coords_g,coords_t]);
            })
        })
    })
    
    describe('setLot', function() {
        it('should set the locaiton to the lot\'s location', function() {
            var s = new Spot();
            var l = new Lot();
            var location = [1,2];
            l.location.coordinates = location;
            return s.setLot(l).then(function(spot) {
                expect(s.location.coordinates).to.deep.include.all.members(location);
            })
        })
        it('should error if invalid lot id', function() {
            var s = new Spot();
            var tests = 0;
            [
                null,
                undefined,
                123,
                true
            ].forEach(function (input) {
                s.setLot(input)
                .then(function(spot) {
                    done(input || 'empty');
                })
                .catch(function(err) {
                    expect(s.lot).to.not.be.ok;
                    if (++test >= arr.length)
                        done();
                })
            });
        })
        
        it('should set the lot id in the spot', function() {
            var s = new Spot();
            var id = ObjectId();
            return s.setLot(id).then(function(spot) {
                expect(s.lot).to.equal(id);
            })
        });
        
        it('should set the id of the given lot in the spot', function() {
            var s = new Spot();
            var l = new Lot();
            return s.setLot(l).then(function(spot) {
                expect(s.lot._id).to.deep.equal(l._id);
            })
        });
    })

    describe('setDescription', function() {
        it('should set the description', function() {
            var s = new Spot();
            var d = 'some description';
            return s.setDescription(d).then(function(spot) {
                expect(s.description).to.deep.equal(d);
            })
        })
    })
    
    describe('getLot', function() {
        it('should return the lot id', function() {
            var s = new Spot();
            var id = ObjectId();
            s.lot = id;
            expect(s.getLot()).to.equal(id);
        })
    })

    describe('getDescription', function() {
        it('should return the description', function() {
            var s = new Spot();
            var d = 'some description';
            s.description = d;
            expect(s.getDescription()).to.deep.equal(d);
        })
    })
    
    describe('removeLot', function() {
        it('should remove the lot', function() {
            var s = new Spot();
            s.lot = 'some lot';
            return s.removeLot().then(function(spot) {
                expect(s.lot).not.be.ok;
            })
        })
    })

    describe('removeDescription', function() {
        it('should remove the description', function() {
            var s = new Spot();
            s.description = 'some description';
            return s.removeDescription().then(function(spot) {
                expect(s.description).not.be.ok;
            })
        })
    })
    
    describe('addAvailability', function() {
        it('should be able to parse string', function() {
            var start = '2010/01/01';
            var end = '2016/01/01';
            var s = new Spot();
            return s.addAvailability({start: start, end: end})
            .then(function(spot) {
                expect(s.available.check(new Date(start))).to.be.true;
                expect(s.available.check(new Date(end))).to.be.false;
            })
        })
        
        describe('should add the given recuring range to the availability', function() {
            it('given an rep count', function() {
                var s = new Spot();
                s.save = function(cb){cb(null)}
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var count = 3;
                var oneday = 1000*60*60*24;
                return s.addAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    count: count
                }).then(function(spot) {
                    expect(s.available.ranges).to.have.length(count);
                    for (var i=0; i < count*2; i += 2)
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                });
            })
            
            it('given a limit', function() {
                var s = new Spot();
                s.save = function(cb){cb(null)}
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var finish = new Date('2016/01/07');
                var oneday = 1000*60*60*24;
                var count = 3;
                return s.addAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    finish: finish    
                }).then(function(spot) {
                    expect(s.available.ranges).to.have.length(count);
                    for (var i=0; i < count*2; i += 2)
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                })
            })
            
        })
        
        it('should fail if given bad input', function() {
            var s = new Spot();
            var tests = 0;
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
                s.addAvailability(input)
                .then(function() {
                    expect.fail();
                }).catch(function(err) {
                    expect(err).to.be.ok;
                    expect(s.available.ranges).to.have.length(0);
                    if (++test >= arr.length)
                        done();
                })
            });
        })
        
        it('should add the given time range object to the available array', function() {
            var s = new Spot();
            var start = new Date('2016/01/01');
            var end = new Date('2016/02/01');
            expect(s.available.check(new Date('2015/01/15'))).to.be.false;
            expect(s.available.check(new Date('2016/01/15'))).to.be.false;
            expect(s.available.check(new Date('2017/01/15'))).to.be.false;
            return s.addAvailability({start: start, end: end})
            .then(function(spot) {
                expect(s.available.check(new Date('2015/01/15'))).to.be.false;
                expect(s.available.check(new Date('2016/01/15'))).to.be.true;
                expect(s.available.check(new Date('2017/01/15'))).to.be.false;
            })
        })
    })
    
    describe('removeAvailability', function() {
        it('should be able to parse string', function() {
            var start = '2010/01/01';
            var end = '2016/01/01';
            var s = new Spot();
            s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
            return s.removeAvailability({start: start, end: end})
            .then(function(spot) {
                expect(s.available.check(new Date(start))).to.be.false;
                expect(s.available.check(new Date(end))).to.be.true;
            })
        })
        
        describe('should remove the given recuring range from the availability', function() {
            it('given an rep count', function() {
                var s = new Spot();
                s.save = function(cb){cb(null)}
                s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var count = 3;
                var oneday = 1000*60*60*24;
                return s.removeAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    count: count
                }).then(function(spot) {
                    expect(s.available.ranges).to.have.length(count + 1);
                    for (var i=1; i < count*2; i += 2) {
                        expect(s.available.check(new Date('2016/01/' + (i)))).to.be.false;
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    }
                })
            })
            
            it('given a limit', function() {
                var s = new Spot();
                s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var finish = new Date('2016/01/07');
                var oneday = 1000*60*60*24;
                var count = 3;
                return s.removeAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    finish: finish    
                }).then(function(spot) {
                    expect(s.available.ranges).to.have.length(count + 1);
                    for (var i=1; i < count*2; i += 2) {
                        expect(s.available.check(new Date('2016/01/' + (i)))).to.be.false;
                        expect(s.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    }
                })
            })
            
        })
        
        it('should fail if given bad input', function() {
            var s = new Spot();
            var tests = 0;
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
                s.removeAvailability(input)
                .then(function(spot) {
                    done(input || 'empty')
                }).catch(function(err) {
                    expect(s.available.ranges).to.have.length(0);
                    if (++test >= arr.length)
                        done();
                })
            });
        })
        
        it('should remove the given time range object from the available array', function() {
            var s = new Spot();
            s.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
            var start = new Date('2016/01/01');
            var end = new Date('2016/02/01');
                expect(s.available.check(new Date('2015/01/15'))).to.be.true;
                expect(s.available.check(new Date('2016/01/15'))).to.be.true;
                expect(s.available.check(new Date('2017/01/15'))).to.be.true;
            return s.removeAvailability({start: start, end: end})
            .then(function(spot) {
                expect(s.available.check(new Date('2015/01/15'))).to.be.true;
                expect(s.available.check(new Date('2016/01/15'))).to.be.false;
                expect(s.available.check(new Date('2017/01/15'))).to.be.true;
            })
        })
    })

    describe('getPrice', function() {
        it('should return null if no price is set', function() {
            var s = new Spot();
            var price = s.getPrice();
            expect(price).to.be.null;
        })

        it('should return the price', function() {
            var pricePerHour = 123.45;
            var s = new Spot();
            s.price.perHour = pricePerHour;
            expect(s.getPrice()).to.deep.equal({
                perHour: pricePerHour
            });
        })
    })

    describe('setPrice', function() {
        it('should set the price', function() {
            var pricePerHour = 123.45;
            var s = new Spot();
            return s.setPrice({
                perHour: pricePerHour
            })
            .then(function() {
                expect(s.price.perHour).to.equal(pricePerHour);
            });
        })
    })
})

routeTest('spotController', [
        {
            verb: verbs.GET,
            route: '/api/spots',
            method: 'GetAllSpots',
            ignoreId: true,
            ignoreOwner: true
        },
        {
            verb: verbs.PUT,
            route: '/api/spots',
            method: 'CreateSpot',
            ignoreId: true,
            ignoreOwner: true
        },
        {
            verb: verbs.GET,
            route: '/api/spots/near',
            method: 'GetNearestSpot',
            ignoreId: true,
            ignoreAuth: true,
            ignoreAdmin: true,
            ignoreOwner: true
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id',
            method: 'GetSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/lot',
            method: 'GetLotForSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/lot',
            method: 'SetLotForSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/lot/remove',
            method: 'RemoveLotFromSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/location',
            method: 'GetLocationOfSpot'
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
            method: 'GetAllAvailabilityOfSpot'
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
            method: 'GetAllBookedTimeOfSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/schedule',
            method: 'GetEntireScheduleOfSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/price',
            method: 'GetPriceOfSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/price',
            method: 'SetPriceOfSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/name',
            method: 'GetNameOfSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/name',
            method: 'SetNameOfSpot'
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/description',
            method: 'GetDescriptionOfSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/description',
            method: 'SetDescriptionOfSpot'
        }
    ])

describe('spotController', function() {
    var app,
        req = {},
        res = {};
    
    beforeEach(function() {
        var inject = server.GetDefaultInjection();
        app = server(inject);
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })
    
    describe('GetAllSpots', function() {
        it('should return all spots', function(done) {
            var spots = [new Spot(), new Spot()];
            var simpleSpots = spots.map(function(s) { return s.toJSON({getters: true}) });
            app.db.spots = {
                find: mockPromise(spots)
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(simpleSpots)).to.be.true;
                done();
            }
            app.spotController.GetAllSpots(null, res);
        })
    })
    
    describe('GetSpot', function() {
        it('should return the next available range of the spot', function(done) {
            var spot = new Spot();
            var oneday = 1000*60*60*24;
            var now = new Date();
            var start = new Date(now.valueOf() - oneday);
            var end = new Date(now.valueOf() + oneday);
            var range = { start: start, end: end };
            spot.available.addRange(start, end);
            var simpleSpot = spot.toJSON({getters: true});
            req.doc = spot;
            req.params.id = spot.id;
            res.sent = function() {
                expect(simpleSpot).to.have.deep.property('available.next');
                expect(simpleSpot.available.next).to.deep.equal(range);
                expect(res.sentWith(simpleSpot)).to.be.true;
                done();
            }
            app.spotController.GetSpot(req, res);
        })

        it('should get spot with specified id', function(done) {
            var spot = new Spot();
            var simpleSpot = spot.toJSON({getters: true});
            req.doc = spot;
            req.params.id = spot.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(simpleSpot)).to.be.true;
                done();
            }
            app.spotController.GetSpot(req, res);
        })
        
        
    })
    
    describe('CreateSpot', function() {
        var emptySpot;
        
        before(function() {
            emptySpot = new Spot().toJSON({getters: true});
            delete emptySpot.id;
            delete emptySpot._id;    
        })

        it('should try to get default available schedule from lot', function(done) {
            var spot = Object.assign({}, emptySpot);
            var lot = new Lot();
            var avail = {
                start: new Date('2016/01/01'),
                end: new Date('2016/01/01')
            }
            lot.available.addRange(avail.start, avail.end);
            spot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            spot.price = {
                perHour: 123.45
            }
            spot.lot = lot._id;
            req.body.spot = spot;
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.lots = {
                findById: mockPromise(lot)
            }
            app.db.spots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj.available.ranges).to.deep.include.all.members(lot.toJSON({getters: true}).available.ranges);
                    return mockPromise(obj)();
                }
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })

        it('should fail if price is not specified', function(done) {
            var spot = Object.assign({}, emptySpot);
            spot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            req.body.spot = spot;
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.spots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj).to.deep.equal(spot);
                    return mockPromise(obj)();
                }
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.BadInput)).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })

        it('should take the price from the lot if lot is provided', function(done) {
            var spot = Object.assign({}, emptySpot);
            var lot = new Lot({
                location: {
                    address: '123 fake st',
                    coordinates: [12,34]
                },
                price: {
                    perHour: 123.45
                }
            });
            spot.lot = lot._id;
            req.body.spot = spot;
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.lots = {
                findById: mockPromise(lot)
            }
            app.db.spots = {
                create: function(obj) {
                    expect(obj.price.perHour).to.equal(lot.price.perHour);
                    return mockPromise(obj)();
                }
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })

        it('should set the spot\'s user', function(done) {
            var spot = Object.assign({}, emptySpot);
            var user = new User();
            spot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            spot.price = {
                perHour: 123.45
            }
            spot.user = user._id;
            req.body.spot = spot;
            req.user = {
                id: user.id
            }
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            res.sendBad = done;
            app.db.spots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj).to.deep.equal(spot);
                    return mockPromise(obj)();
                }
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })

        it('should take location from lot', function(done) {
            var spot = Object.assign({}, emptySpot);
            var lot = new Lot();
            lot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            spot.lot = lot._id;
            spot.price = {
                perHour: 123.45
            }
            req.body.spot = spot;
            app.db.spots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj.location).to.deep.equal(lot.toObject().location);
                    return mockPromise(obj)();
                }
            }
            app.db.lots = {
                findById: mockPromise(lot)
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })

        it('should error if no location was provided and no lot was specified', function(done) {
            app.db.spots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj).to.deep.equal(emptySpot);
                    return mockPromise(obj)();
                }
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.BadInput)).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
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
                        expect(res.sendBad.callCount).to.equal(arr.length);
                        done();                    
                    }
                }
                app.spotController.CreateSpot(req, res);
            })
        })
        
        it('if couldnt create spot should send error', function(done) {
            app.db.spots = {
                create: mockPromise(null, new Errors.TestError())
            }
            app.geocoder.geocode = mockPromise([{}]);
            req.body = {
                location: {
                    address: 'some address'
                },
                price: {
                    perHour: 123.45
                }
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError), res.sendBad.firstCall.args[0]).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })
        
        it('if couldnt insert entire collection should send error', function(done) {
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.spots = {
                collection: {
                    insert: mockPromise(null, new Errors.TestError())
                }
            }
            req.body = {
                location: {
                    address: 'some address'
                },
                price: {
                    perHour: 123.45
                },
                count: 5
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError), res.sendBad.firstCall.args[0]).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })
        
        it('should create n spots with the given props', function(done) {
            var count = 5;
            var spot = Object.assign({}, emptySpot);
            var arr = [];
            for (var i=0;i<count;i++) {
                delete spot.id;
                delete spot._id;
                arr.push(spot);
            }
            spot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            spot.price = {
                perHour: 123.45
            };
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.spots = {
                collection: {
                    insert: function(obj) {
                        expect(obj).to.have.length(count);
                        expect(obj[0]).to.have.deep.property('price.perHour');
                        obj.forEach(function(o, i) {
                            delete o.id;
                            delete o._id;
                        })
                        expect(obj).to.deep.include.all.members(arr);
                        return mockPromise(obj)();
                    }
                }
            }
            req.body.count = count;
            req.body.spot = spot;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })
        
        it('should create a spot with the given props', function(done) {
            var spot = Object.assign({}, emptySpot);
            spot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            spot.price = {
                perHour: 123.45
            };
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.spots = {
                create: function(obj) {
                    expect(obj).to.have.property('price');
                    return mockPromise(obj)();
                }
            }
            req.body.spot = spot;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();    
            }
            app.spotController.CreateSpot(req, res);
        })
        
        it('should create a blank spot given no additional params', function(done) {
            var spot = Object.assign({}, emptySpot);
            spot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            spot.price = {
                perHour: 123.45
            }
            req.body.spot = spot;
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.spots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj).to.deep.equal(spot);
                    return mockPromise(obj)();
                }
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })
        
        it('should create n blank spots given a count n and no additional params', function(done) {
            var spot = Object.assign({}, emptySpot);
            spot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            spot.price = {
                perHour: 123.45
            }
            delete spot.id;
            delete spot._id;
            var count = 5;
            var arr = [];
            for (var i=0;i<count;i++) {
                arr.push(spot);
            }
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.spots = {
                collection: {
                    insert: sinon.spy(function(obj) {
                        expect(obj).to.have.length(count);
                        obj.forEach(function(o) {
                            delete o.id;
                            delete o._id;
                        })
                        expect(obj).to.deep.include.all.members(arr);
                        return mockPromise(obj)();
                    })
                }
            }
            req.body.count = count;
            req.body.spot = spot;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.CreateSpot(req, res);
        })
    })
    
    describe('GetNearestSpot', function() {
        it('should return nearest AVAILABLE spots', function(done) {
            var spots = [new Spot(), new Spot];
            var limitedSpots = spots.slice(0, 1);
            var long = 12;
            var lat = 21;
            app.db.spots = {
                find: mockPromise(spots)
            }
            req.query = {
                long: long,
                lat: lat,
                available: new Date()
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({spots: limitedSpots})).to.be.true;
                done();
            }
            app.spotController.GetNearestSpot(req, res);
        })
        
        it('should return nearest COUNT spots', function(done) {
            var spots = [new Spot(), new Spot];
            var limitedSpots = spots.slice(0, 1);
            var long = 12;
            var lat = 21;
            app.db.spots = {
                find: mockPromise(spots)
            }
            req.query = {
                long: long,
                lat: lat,
                count: 1
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({spots: limitedSpots})).to.be.true;
                done();
            }
            app.spotController.GetNearestSpot(req, res);
        })
        
        it('should return nearest spots', function(done) {
            var spots = [new Spot()];
            var long = 12;
            var lat = 21;
            app.db.spots = {
                find: mockPromise(spots)
            }
            req.query = {
                long: long,
                lat: lat
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({spots: spots})).to.be.true;
                done();
            }
            app.spotController.GetNearestSpot(req, res);
        })
        
        it('should error if long and lat are not specified', function(done) {
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.BadInput)).to.be.true;
                done();
            }
            app.spotController.GetNearestSpot(req, res);
        })
        
    })
    
    describe('GetLotForSpot', function() {
        it('should error if lot is not set', function(done) {
            var s = new Spot();
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();            
            }
            app.spotController.GetLotForSpot(req, res);
        })

        it('should return the lot of the spot', function(done) {
            var s = new Spot();
            var l = new Lot();
            s.lot = l;
            app.db.lots = {
                findById: mockPromise(l)
            }
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(l.toJSON({getters: true})));
                done();                
            }
            app.spotController.GetLotForSpot(req, res);
        })
    })

    describe('RemoveLotFromSpot', function() {
        it('shouldremove the lot from the spot', function(done) {
            var s = new Spot({
                lot: new Lot()
            });
            sinon.stub(s, 'removeLot', mockPromise());
            req.doc = s;
            req.params.id = s.id;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(s.removeLot.calledOnce).to.be.true;
                done();                
            }
            app.spotController.RemoveLotFromSpot(req, res);
        })
    })
    
    describe('SetLotForSpot', function() {
        it('should set the lot of the spot', function(done) {
            var s = new Spot();
            var l = new Lot();
            sinon.stub(s, 'setLot');
            req.doc = s;
            app.db.lots = {
                findById: mockPromise(l)
            }
            req.params.id = s.id;
            req.body = l.toJSON();
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(s.setLot.calledOnce).to.be.true;
                expect(s.setLot.calledWith(l)).to.be.true;
                done();                
            }
            app.spotController.SetLotForSpot(req, res);
        })
    })
    
    describe('GetLocationOfSpot', function() {
        it('should return the spot\'s location', function(done) {
            var s = new Spot();
            s.location = {
                address: '123 fake st',
                coordinates: [123, 456]
            }
            var expected = {
                address: s.getAddress(),
                coordinates: s.getLocation()
            }
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({location: expected}), JSON.stringify(res.send.firstCall.args[0]) + '\n' + JSON.stringify(expected)).to.be.true;
                done();
            }
            app.spotController.GetLocationOfSpot(req, res);
        });
    })
    
    describe('GetAllBookingsForSpot', function() {
        it('should return an empty array if no bookings are assigned', function(done) {
            req.doc = new Spot();
            app.db.bookings = {
                find: mockPromise([])
            }
            res.sent = function(body) {
                expect(res.sentWith({bookings: []}))
                done();
            }
            req.params.id = '123';
            app.spotController.GetAllBookingsForSpot(req, res);
        })
        
        
        it('should return the spot\'s bookings', function(done) {
            var s = new Spot();
            req.doc = s;
            var expected = [
                new Booking(),
                new Booking()
            ]
            app.db.bookings = {
                find: function(search) {
                    expect(search.spot).to.deep.equal(s.id);
                    return mockPromise(expected)();
                }
            }
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(expected)).to.be.true;
                done();
            }
            app.spotController.GetAllBookingsForSpot(req, res);
        });
        
        
    })
    
    describe('AddBookingsToSpot', function() {
        it('should fail if bookings do not have start and end times', function(done) {
            var s = new Spot();
            s.price.perHour = 123.45;
            var b = new Booking();
            req.params.id = s.id;
            req.body = b;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.BadInput)).to.be.true;
                done();
            }
            app.spotController.AddBookingsToSpot(req, res);
        })

        it('should set the user', function(done) {
            var s = new Spot();
            var user = new User();
            s.price.perHour = 123.45;
            var b = new Booking();
            b.start = b.end = new Date();
            b.user = user._id;
            sinon.stub(s, 'addBookings', function(_b) {
                expect(_b).to.deep.include(b);
                return mockPromise(s)();
            })
            sinon.stub(Booking.prototype, 'setSpot', function() {
                expect(this.user).to.deep.equal(user._id);
                return mockPromise(b)();
            });
            req.doc = s;
            req.params.id = s.id;
            req.body = b;
            req.user = {
                id: user.id
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(b.setSpot.calledOnce).to.be.true;
                Booking.prototype.setSpot.restore();
                done();
            }
            app.spotController.AddBookingsToSpot(req, res);
        })

        it('should create booking object and add them', function(done) {
            var s = new Spot();
            s.price.perHour = 123.45;
            var b = new Booking();
            b.start = b.end = new Date();
            sinon.stub(s, 'addBookings', function(_b) {
                expect(_b).to.deep.include(b);
                return mockPromise(s)();
            })
            sinon.stub(Booking.prototype, 'setSpot', mockPromise(b));
            req.doc = s;
            req.params.id = s.id;
            req.body = b;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(b.setSpot.calledOnce).to.be.true;
                Booking.prototype.setSpot.restore();
                done();
            }
            app.spotController.AddBookingsToSpot(req, res);
        })
        
        it('should fail if addBookings failed', function(done) {
            var s = new Spot();
            sinon.stub(Booking.prototype, 'setSpot', mockPromise(new Booking()));
            sinon.stub(s, 'addBookings', mockPromise(null, new Errors.TestError()));
            req.doc = s;
            req.params.id = s.id;
            req.body.bookings = new Booking({
                start: new Date(),
                end: new Date()
            });
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                Booking.prototype.setSpot.restore();
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
                res.sent = function() {
                    if (res.send.callCount >= arr.length) {
                        expect(res.sendBad.callCount).to.equal(res.send.callCount);
                        done();
                    }
                }
                app.spotController.AddBookingsToSpot(req, res);
            })
        })
        
        
    })
    
    describe('RemoveBookingsFromSpot', function() {
        it('should handle an array of inputs', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = b.end = new Date();
            sinon.stub(s, 'removeBookings');
            sinon.stub(b, 'remove');
            req.doc = s;
            app.db.bookings = {
                find: mockPromise([b])
            }
            req.params.id = s.id;
            req.body.bookings = [b];
            res.sent = function(status) {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.RemoveBookingsFromSpot(req, res);
        })
        
        it('should find and remove the given booking', function(done) {
            var s = new Spot();
            var b = new Booking();
            b.start = b.end = new Date();
            sinon.stub(s, 'removeBookings');
            sinon.stub(b, 'remove');
            req.doc = s;
            app.db.bookings = {
                find: mockPromise([b])
            }
            req.params.id = s.id;
            req.body.id = b.id;
            res.sent = function(status) {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.RemoveBookingsFromSpot(req, res);
        })
        
        it('should fail if removeBookings failed', function(done) {
            var s = new Spot();
            req.doc = s;
            sinon.stub(s, 'removeBookings', mockPromise(null, new Errors.TestError()));
            app.db.bookings = {
                find: mockPromise([])
            }
            req.params.id = s.id;
            req.body.bookings = new Booking();
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
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
                res.sent = function() {
                    if (res.send.callCount >= arr.length) {
                        expect(res.sendBad.callCount).to.equal(res.send.callCount);
                        done();
                    }
                }
                app.spotController.RemoveBookingsFromSpot(req, res);
            })
        })
        
        
    })
    
    describe('GetAllAvailabilityOfSpot', function() {
        it('should return the available ranges for the spot', function(done) {
            var s = new Spot();
            s.available.addRange(new Date('2016/01/01'), new Date());
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({available: s.available.ranges})).to.be.true;
                done();
            }
            app.spotController.GetAllAvailabilityOfSpot(req, res);
        })
        
        
    })
    
    describe('AddAvailabilityToSpot', function() {
        it('should add the entire request body as a schedule if no shedules are specified', function(done) {
            var s = new Spot();
            req.doc = s;
            var schedule = {someProp: 'somevalue'};
            sinon.stub(s, 'addAvailability', mockPromise());
            req.params.id = s.id;
            req.body = schedule;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.AddAvailabilityToSpot(req, res);
        })
        it('should add the given schedules to the spot\'s availability', function(done) {
            var s = new Spot();
            req.doc = s;
            var schedules = [{someProp: 'somevalue'}];
            sinon.stub(s, 'addAvailability', mockPromise());
            req.params.id = s.id;
            req.body.schedules = schedules;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.AddAvailabilityToSpot(req, res);
        })
        
        it('should fail if addAvailability failed', function(done) {
            var s = new Spot();
            req.doc = s;
            var schedules = [{someProp: 'somevalue'}];
            sinon.stub(s, 'addAvailability', mockPromise(null, new Errors.TestError()));
            req.params.id = s.id;
            req.body.schedules = schedules;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                done();    
            }
            app.spotController.AddAvailabilityToSpot(req, res);
        })
        
        
    })
    
    describe('RemoveAvailabilityFromSpot', function() {
        it('should remove the entire request body as a schedule if no shedules are specified', function(done) {
            var s = new Spot();
            sinon.stub(s, 'removeAvailability', mockPromise());
            req.doc = s;
            var schedule = {someProp: 'somevalue'};
            req.params.id = s.id;
            req.body = schedule;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.RemoveAvailabilityFromSpot(req, res);
        })
        it('should remove the given schedules to the spot\'s availability', function(done) {
            var s = new Spot();
            req.doc = s;
            var schedules = [{someProp: 'somevalue'}];
            sinon.stub(s, 'removeAvailability', mockPromise());
            req.params.id = s.id;
            req.body.schedules = schedules;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.spotController.RemoveAvailabilityFromSpot(req, res);
        })
        
        it('should fail if removeAvailability failed', function(done) {
            var s = new Spot();
            req.doc = s;
            var schedules = [{someProp: 'somevalue'}];
            sinon.stub(s, 'removeAvailability', mockPromise(null, new Errors.TestError()))
            req.params.id = s.id;
            req.body.schedules = schedules;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                done();
            }
            app.spotController.RemoveAvailabilityFromSpot(req, res);
        })
        
        
    })
    
    describe('GetAllBookedTimeOfSpot', function() {
        it('should return the available ranges for the spot', function(done) {
            var s = new Spot();
            s.booked.addRange(new Date('2016/01/01'), new Date());
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({booked: s.booked.ranges})).to.be.true;
                done();
            }
            app.spotController.GetAllBookedTimeOfSpot(req, res);
        })
        
        
    })
    
    describe('GetEntireScheduleOfSpot', function() {
        it('should return the available ranges for the spot', function(done) {
            var s = new Spot();
            s.booked.addRange(new Date('2016/01/01'), new Date());
            s.available.addRange(new Date('2016/01/01'), new Date());
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({
                        booked: s.booked.ranges,
                        available: s.available.ranges
                    })).to.be.true;
                done();
            }
            app.spotController.GetEntireScheduleOfSpot(req, res);
        })
        
        
    })
    
    describe('GetPriceOfSpot', function() {
        it('should error if price is not set', function(done) {
            var s = new Spot();
            var price = 123.45;
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.spotController.GetPriceOfSpot(req, res);
        })

        it('should return the price of the spot', function(done) {
            var s = new Spot();
            var price = 123.45;
            s.price.perHour = price;
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({
                    perHour: price
                })).to.be.true;
                done();
            }
            app.spotController.GetPriceOfSpot(req, res);
        })
        
        
    })
    
    describe('SetPriceOfSpot', function() {
        it('should set the price of the spot', function(done) {
            var s = new Spot();
            var pricePerHour = 123.45;
            sinon.stub(s, 'setPrice', mockPromise());
            req.doc = s;
            req.params.id = s.id;
            req.body.perHour = pricePerHour;
            res.sent = function() {
                expect(s.setPrice.calledOnce).to.be.true;
                done();
            }
            app.spotController.SetPriceOfSpot(req, res);
        })
    })

    describe('GetNameOfSpot', function() {
        it('should get the name of the spot', function(done) {
            var s = new Spot();
            var name = s.name = 'some name';
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(name)).to.be.true;
                done();
            }
            app.spotController.GetNameOfSpot(req, res);
        });
    })

    describe('SetNameOfSpot', function() {
        it('should set the name of the spot', function(done) {
            var s = new Spot();
            sinon.stub(s, 'setName', mockPromise());
            var name = 'some name';
            req.doc = s;
            req.params.id = s.id;
            req.body.name = name;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(s.setName.calledOnce).to.be.true;
                expect(s.setName.calledWith(name)).to.be.true;
                done();
            }
            app.spotController.SetNameOfSpot(req, res);
        });
    })

    describe('GetIfSpotIsReserved', function() {
        it('should get if the spot is reserved', function(done) {
            var s = new Spot();
            var reserved = s.reserved = true;
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(reserved)).to.be.true;
                done();
            }
            app.spotController.GetIfSpotIsReserved(req, res);
        });
    })

    describe('SetIfSpotIsReserved', function() {
        it('should set if the spot is reserved', function(done) {
            var s = new Spot();
            sinon.stub(s, 'setReserved', mockPromise());
            var reserved = true;
            req.doc = s;
            req.params.id = s.id;
            req.body.reserved = reserved;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(s.setReserved.calledOnce).to.be.true;
                expect(s.setReserved.calledWith(reserved)).to.be.true;
                done();
            }
            app.spotController.SetIfSpotIsReserved(req, res);
        });
    })

    describe('GetDescriptionOfSpot', function() {
        it('should get the description of the spot', function(done) {
            var s = new Spot();
            var description = s.description = 'some description';
            req.doc = s;
            req.params.id = s.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(description)).to.be.true;
                done();
            }
            app.spotController.GetDescriptionOfSpot(req, res);
        });
    })

    describe('SetDescriptionOfSpot', function() {
        it('should set the description of the spot', function(done) {
            var s = new Spot();
            sinon.stub(s, 'setDescription', mockPromise());
            var description = 'some description';
            req.doc = s;
            req.params.id = s.id;
            req.body.description = description;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(s.setDescription.calledOnce).to.be.true;
                expect(s.setDescription.calledWith(description)).to.be.true;
                done();
            }
            app.spotController.SetDescriptionOfSpot(req, res);
        });
    })
})