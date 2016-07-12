var expect = require('chai').expect;
var ObjectId = require('mongoose').Types.ObjectId;
var sinon = require('sinon');
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var server = require('./../../server');
var Spot = require('./../models/Spot');
var Lot = require('./../models/Lot');
var Booking = require('./../models/Booking');

describe.only('Spot schema', function() {
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
            return Promise.all([
                null,
                undefined,
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}},
                ''
            ].map(function(input) {
                return s.setLocation([input,input], 'some addres')
            }))
            .then(function(location) {
                expect.fail();
            })
            .catch(function(err) {
                expect(s.location.coordinates).to.not.be.ok;
            })
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
            return Promise.all([
                null,
                undefined,
                '123',
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}}
            ].map(function(input) {
                return s.setLocation(input, 'some addres')
            }))
            .then(function(location) {
                expect.fail();
            })
            .catch(function(err) {
                expect(s.location.address).to.not.be.ok;
            })
        })
        
        it('should fail if object does not have long lat props', function() {
            var s = new Spot();
            expect(s.location.coordinates).to.not.be.ok;
            return Promise.all([
                null,
                undefined,
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}},
                ''
            ].map(function(input) {
                return s.setLocation({long:input,lat:input}, 'some addres')
            }))
            .then(function(location) {
                expect.fail();
            })
            .catch(function(err) {
                expect(s.location.address).to.not.be.ok;
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
        it('should error if invalid lot id', function() {
            var s = new Spot();
            return Promise.all([
                null,
                undefined,
                123,
                true
            ].map(function (input) {
                return s.setLot(input);
            }))
            .then(function(spot) {
                expect.fail();
            })
            .catch(function(err) {
                expect(s.lot).to.not.be.ok;
            })
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
                expect(s.lot).to.deep.equal(l._id);
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
            return Promise.all([
                123,
                'abc',
                function(){expect.fail()},
                null,
                undefined,
                {},
                {start: 456},
                {start: function(){expect.fail()}, end: function(){expect.fail()}}
            ].map(function(input) {
                return s.addAvailability(input);
            })).then(function() {
                expect.fail();
            }).catch(function(err) {
                expect(err).to.be.ok;
                expect(s.available.ranges).to.have.length(0);
            })
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
            return Promise.all([
                123,
                'abc',
                function(){expect.fail()},
                null,
                undefined,
                {},
                {start: 456},
                {start: function(){expect.fail()}, end: function(){expect.fail()}}
            ].map(function(input) {
                s.removeAvailability(input);
            })).then(function(spot) {
                expect.fail()
            }).catch(function(err) {
                expect(s.available.ranges).to.have.length(0);
            })
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
            ignoreId: true,
            ignoreAuth: true,
            ignoreAdmin: true
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
        },
        {
            verb: verbs.GET,
            route: '/api/spots/:id/price',
            method: 'GetPriceForSpot'
        },
        {
            verb: verbs.PUT,
            route: '/api/spots/:id/price',
            method: 'SetPriceForSpot'
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
            var simpleSpots = spots.map(function(s) { return s.toJSON({getters: true}) });
            app.db.spots = {
                find: function(obj, cb) {
                    cb(null, spots);
                }
            }
            app.spotController.GetAllSpots(null, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(simpleSpots)).to.be.true;
        })
    })
    
    describe('GetSpot', function() {
        it('should return the next available range of the spot', function() {
            var spot = new Spot();
            var oneday = 1000*60*60*24;
            var now = new Date();
            var start = new Date(now.valueOf() - oneday);
            var end = new Date(now.valueOf() + oneday);
            var range = { start: start, end: end };
            spot.available.addRange(start, end);
            var simpleSpot = spot.toJSON({getters: true});
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(spot.id);
                    cb(null, spot);
                }
            }
            req.params.id = spot.id;
            app.spotController.GetSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(simpleSpot).to.have.deep.property('available.next');
            expect(simpleSpot.available.next).to.deep.equal(range);
            expect(res.sentWith(simpleSpot)).to.be.true;
        })

        it('should get spot with specified id', function() {
            var spot = new Spot();
            var simpleSpot = spot.toJSON({getters: true});
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(spot.id);
                    cb(null, spot);
                }
            }
            req.params.id = spot.id;
            app.spotController.GetSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith(simpleSpot)).to.be.true;
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
            delete emptySpot.id;
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
            for (var i=0;i<count;i++) {
                delete spot.id;
                delete spot._id;
                arr.push(spot);
            }
            spot.address = '123 fake st';
            app.db.spots = {
                collection: {
                    insert: function(obj, cb) {
                        expect(obj).to.have.length(count);
                        expect(obj[0]).to.have.property('address');
                        obj.forEach(function(o) {
                            delete o.id;
                            delete o._id;
                        })
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
                    delete obj.id;
                    delete obj._id;
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
            for (var i=0;i<count;i++) {
                delete emptySpot.id;
                delete emptySpot._id;
                arr.push(emptySpot);
            }
            app.db.spots = {
                collection: {
                    insert: sinon.spy(function(obj, cb) {
                        expect(obj).to.have.length(count);
                        obj.forEach(function(o) {
                            delete o.id;
                            delete o._id;
                        })
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
    
    describe.skip('GetLocationForSpot', function() {
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
    
    describe.skip('SetLocationForSpot', function() {
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
    
    describe.skip('GetAllBookingsForSpot', function() {
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
    
    describe.skip('AddBookingsToSpot', function() {
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
    
    describe.skip('RemoveBookingsFromSpot', function() {
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
    
    describe('GetPriceForSpot', function() {
        it('should error if price is not set', function() {
            var s = new Spot();
            var price = 123.45;
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            app.spotController.GetPriceForSpot(req, res);
            expect(res.sendBad.calledOnce).to.be.true;
        })

        it('should return the price of the spot', function() {
            var s = new Spot();
            var price = 123.45;
            s.price.perHour = price;
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            app.spotController.GetPriceForSpot(req, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.sentWith({
                perHour: price
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
    
    describe('SetPriceForSpot', function() {
        it('should set the price of the spot', function() {
            var s = new Spot();
            var pricePerHour = 123.45;
            sinon.stub(s, 'setPrice', function(price, cb) {
                expect(price.perHour).to.equal(pricePerHour);
                cb(null, this);
            })
            app.db.spots = {
                findById: function(id, cb) {
                    expect(id).to.equal(s.id);
                    cb(null, s);
                }
            }
            req.params.id = s.id;
            req.body.perHour = pricePerHour;
            app.spotController.SetPriceForSpot(req, res);
            expect(s.setPrice.calledOnce).to.be.true;
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