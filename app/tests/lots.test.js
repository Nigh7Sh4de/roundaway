var expect = require('chai').expect;
var sinon = require('sinon');
var Errors = require('./../errors');
var mockPromise = require('./mockPromise');
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var server = require('./../../server');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');
var User = require('./../models/User');
var Booking = require('./../models/Booking');

describe('Lot schema', function() {
    before(function() {
        sinon.stub(Lot.prototype, 'save', function(cb) { cb(null, this) });
    })
    
    after(function() {
        Lot.prototype.save.restore();
    })


    describe('addAttendants', function() {
        it('should add the given attendants User objects', function() {
            var l = new Lot();
            expect(l.attendants).to.have.length(0);
            var u = new User();
            return l.addAttendants(u)
            .then(function() {
                expect(l.attendants).to.deep.include(u.id);
            })
        })
        
        it('should add the given attendants User id', function() {
            var l = new Lot();
            expect(l.attendants).to.have.length(0);
            var u = new User();
            return l.addAttendants(u.id)
            .then(function() {
                expect(l.attendants).to.deep.include(u.id);
            })
        })
        
        it('should add the given attendants User _id', function() {
            var l = new Lot();
            expect(l.attendants).to.have.length(0);
            var u = new User();
            return l.addAttendants(u._id)
            .then(function() {
                expect(l.attendants).to.deep.include(u.id);
            })
        })
    })

    describe('getPrice', function() {
        it('should return null if no price is set', function() {
            var l = new Lot();
            var price = l.getPrice();
            expect(price).to.be.null;
        })

        it('should return the price', function() {
            var pricePerHour = 123.45;
            var l = new Lot();
            l.price.perHour = pricePerHour;
            expect(l.getPrice()).to.deep.equal({
                perHour: pricePerHour
            });
        })
    })

    describe('setPrice', function() {
        it('should set the price', function() {
            var pricePerHour = 123.45;
            var l = new Lot();
            return l.setPrice({
                perHour: pricePerHour
            })
            .then(function() {
                expect(l.price.perHour).to.equal(pricePerHour);
            });
        })
    })

    describe('addAvailability', function() {
        it('should be able to parse string', function() {
            var start = '2010/01/01';
            var end = '2016/01/01';
            var l = new Lot();
            return l.addAvailability({start: start, end: end})
            .then(function(lot) {
                expect(l.available.check(new Date(start))).to.be.true;
                expect(l.available.check(new Date(end))).to.be.false;
            })
        })
        
        describe('should add the given recuring range to the availability', function() {
            it('given an rep count', function() {
                var l = new Lot();
                l.save = function(cb){cb(null)}
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var count = 3;
                var oneday = 1000*60*60*24;
                return l.addAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    count: count
                }).then(function(lot) {
                    expect(l.available.ranges).to.have.length(count);
                    for (var i=0; i < count*2; i += 2)
                        expect(l.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                });
            })
            
            it('given a limit', function() {
                var l = new Lot();
                l.save = function(cb){cb(null)}
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var finish = new Date('2016/01/07');
                var oneday = 1000*60*60*24;
                var count = 3;
                return l.addAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    finish: finish    
                }).then(function(lot) {
                    expect(l.available.ranges).to.have.length(count);
                    for (var i=0; i < count*2; i += 2)
                        expect(l.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                })
            })
            
        })
        
        it('should fail if given bad input', function(done) {
            var l = new Lot();
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
                l.addAvailability(input)
                .then(function() {
                    done(input || 'empty');
                }).catch(function(err) {
                    expect(err).to.be.ok;
                    expect(l.available.ranges).to.have.length(0);
                    if (++tests >= arr.length)
                        done();
                })
            });
        })
        
        it('should add the given time range object to the available array', function() {
            var l = new Lot();
            var start = new Date('2016/01/01');
            var end = new Date('2016/02/01');
            expect(l.available.check(new Date('2015/01/15'))).to.be.false;
            expect(l.available.check(new Date('2016/01/15'))).to.be.false;
            expect(l.available.check(new Date('2017/01/15'))).to.be.false;
            return l.addAvailability({start: start, end: end})
            .then(function(lot) {
                expect(l.available.check(new Date('2015/01/15'))).to.be.false;
                expect(l.available.check(new Date('2016/01/15'))).to.be.true;
                expect(l.available.check(new Date('2017/01/15'))).to.be.false;
            })
        })
    })
    
    describe('removeAvailability', function() {
        it('should be able to parse string', function() {
            var start = '2010/01/01';
            var end = '2016/01/01';
            var l = new Lot();
            l.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
            return l.removeAvailability({start: start, end: end})
            .then(function(lot) {
                expect(l.available.check(new Date(start))).to.be.false;
                expect(l.available.check(new Date(end))).to.be.true;
            })
        })
        
        describe('should remove the given recuring range from the availability', function() {
            it('given an rep count', function() {
                var l = new Lot();
                l.save = function(cb){cb(null)}
                l.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var count = 3;
                var oneday = 1000*60*60*24;
                return l.removeAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    count: count
                }).then(function(lot) {
                    expect(l.available.ranges).to.have.length(count + 1);
                    for (var i=1; i < count*2; i += 2) {
                        expect(l.available.check(new Date('2016/01/' + (i)))).to.be.false;
                        expect(l.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    }
                })
            })
            
            it('given a limit', function() {
                var l = new Lot();
                l.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
                var start = new Date('2016/01/01');
                var end = new Date('2016/01/02');
                var finish = new Date('2016/01/07');
                var oneday = 1000*60*60*24;
                var count = 3;
                return l.removeAvailability({
                    start: start,
                    end: end,
                    interval: 2 * oneday,
                    finish: finish    
                }).then(function(lot) {
                    expect(l.available.ranges).to.have.length(count + 1);
                    for (var i=1; i < count*2; i += 2) {
                        expect(l.available.check(new Date('2016/01/' + (i)))).to.be.false;
                        expect(l.available.check(new Date('2016/01/' + (i + 1)))).to.be.true;
                    }
                })
            })
            
        })
        
        it('should fail if given bad input', function(done) {
            var l = new Lot();
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
                l.removeAvailability(input)
                .then(function(lot) {
                    done(input || 'empty');
                }).catch(function(err) {
                    expect(l.available.ranges).to.have.length(0);
                    if (++tests >= arr.length)
                        done();
                })
            })
        });
        
        it('should remove the given time range object from the available array', function() {
            var l = new Lot();
            l.available.addRange(new Date('2000/01/01'), new Date('2020/01/01'));
            var start = new Date('2016/01/01');
            var end = new Date('2016/02/01');
                expect(l.available.check(new Date('2015/01/15'))).to.be.true;
                expect(l.available.check(new Date('2016/01/15'))).to.be.true;
                expect(l.available.check(new Date('2017/01/15'))).to.be.true;
            return l.removeAvailability({start: start, end: end})
            .then(function(lot) {
                expect(l.available.check(new Date('2015/01/15'))).to.be.true;
                expect(l.available.check(new Date('2016/01/15'))).to.be.false;
                expect(l.available.check(new Date('2017/01/15'))).to.be.true;
            })
        })
    })
    
    describe('getLocation', function() {
        it('should return an array with the lat and long', function() {
            var l = new Lot();
            var coords = [123,456];
            l.location.coordinates = coords;
            expect(l.getLocation()).to.include.all.members(coords);
        })
        
        it('should have the long and lat as props', function() {
            var l = new Lot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = [coords_g, coords_t];
            l.location.coordinates = coords;
            var loc = l.getLocation();
            expect(loc.long).to.equal(coords_g);
            expect(loc.lat).to.equal(coords_t);
        })
    })
    
    describe('setLocation', function() {
        it('should fail if no address is specified', function(done) {
            var l = new Lot();
            var coords = [123, 456];
            var address = '';
            expect(l.address).to.not.be.ok;
            l.setLocation(coords, address, function(err) {
                expect(err).to.be.ok;
                expect(l.address).to.not.be.ok;
                expect(l.location.address).to.not.be.ok;
                done();
            })
        })

        it('should set the address', function(done) {
            var l = new Lot();
            var coords = [123, 456];
            var address = 'some address';
            expect(l.address).to.not.be.ok;
            l.setLocation(coords, address, function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.address).to.deep.equal(address);
                done();
            })
        })
        
        it('should set the location given an array', function(done) {
            var l = new Lot();
            var coords = [123, 456];
            l.setLocation(coords, 'some address', function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members(coords);
                done();
            })
        })
        
        it('should fail given a small array', function(done) {
            var l = new Lot();
            var coords = [123];
            expect(l.location.coordinates).to.not.be.ok;
            l.setLocation(coords, 'some address', function(err) {
                expect(err).to.be.ok;
                expect(l.location.coordinates).to.not.be.ok;
                done();
            })
        })
        
        it('should fail given a large array', function(done) {
            var l = new Lot();
            var coords = [123,456,789];
            expect(l.location.coordinates).to.not.be.ok;
            l.setLocation(coords, 'some address', function(err) {
                expect(err).to.be.ok;
                expect(l.location.coordinates).to.not.be.ok;
                done();
            })
        })
        
        it('should fail if array does not contain numbers', function(done) {
            var l = new Lot();
            expect(l.location.coordinates).not.be.ok;
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
                l.setLocation([input,input], 'some address', function(err) {
                    expect(err).to.be.ok;
                    expect(l.location.coordinates).not.be.ok;
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should parse strings into numbers for arrays', function(done) {
            var l = new Lot();
            var coords_g = '123';
            var coords_t = '456';
            var coords = [coords_g, coords_t];
            l.setLocation(coords, 'some address', function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([
                    parseFloat(coords_g),
                    parseFloat(coords_t)
                ]);
                done();
            })
        })
        
        it('should set the location given an object', function(done) {
            var l = new Lot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = {
                long: coords_g,
                lat: coords_t
        };
            l.setLocation(coords, 'some address', function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
        
        it('should fail if not given good input', function(done) {
            var l = new Lot();
            expect(l.location.coordinates).not.be.ok;
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
                l.setLocation(input, 'some address', function(err) {
                    expect(err).to.be.ok;
                    expect(l.location.coordinates).not.be.ok;
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should fail if object does not have long lat props', function(done) {
            var l = new Lot();
            expect(l.location.coordinates).to.not.be.ok;
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
                l.setLocation({long:input,lat:input}, 'some address', function(err) {
                    expect(err).to.be.ok;
                    expect(l.location.coordinates).not.be.ok;
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should accept lon as long prop', function(done) {
            var l = new Lot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = {
                lon: coords_g,
                lat: coords_t
        };
            l.setLocation(coords, 'some address', function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
        
        it('should parse strings into numbers for objects', function(done) {
            var l = new Lot();
            var coords_g = '123';
            var coords_t = '456';
            var coords = {
                long: coords_g,
                lat: coords_t
        };
            l.setLocation(coords, 'some address', function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
    })
})

routeTest('lotController', [
    {
        verb: verbs.GET,
        route: '/api/lots',
        method: 'GetAllLots',
        ignoreId: true,
        ignoreOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/lots/:id',
        method: 'GetLot'
    },
    {
        verb: verbs.PUT,
        route: '/api/lots',
        method: 'CreateLot',
        ignoreId: true,
        ignoreOwner: true
    },
    {
        verb: verbs.GET,
        route: '/api/lots/:id/location',
        method: 'GetLocationOfLot'
    },
    {
        verb: verbs.GET,
        route: '/api/lots/:id/spots',
        method: 'GetSpotsForLot'
    },
    {
        verb: verbs.PUT,
        route: '/api/lots/:id/available',
        method: 'AddAvailabilityToLot'
    },
    {
        verb: verbs.PUT,
        route: '/api/lots/:id/available/remove',
        method: 'RemoveAvailabilityFromLot'
    },
    {
        verb: verbs.GET,
        route: '/api/lots/:id/price',
        method: 'GetPriceOfLot'
    },
    {
        verb: verbs.PUT,
        route: '/api/lots/:id/price',
        method: 'SetPriceOfLot'
    },
    {
        verb: verbs.GET,
        route: '/api/lots/:id/attendants', 
        method: 'GetAttendantsForLot'
    },
    {
        verb: verbs.PUT,
        route: '/api/lots/:id/attendants', 
        method: 'AddAttendantsToLot'
    }
])

describe('lotController', function() {
    var req = {},
        res = {};
    
    beforeEach(function() {
        app = server(server.GetDefaultInjection());
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })
    
    describe('GetAllLots', function() {
        it('should return all lots', function(done) {
            var lots = [new Lot(), new Lot()];
            app.db.lots = {
                find: mockPromise(lots)
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(lots)).to.be.true;
                done();
            }
            app.lotController.GetAllLots(null, res);
        })
    })
    
    describe('GetLot', function() {
        it('should get lot with specified id', function(done) {
            var lot = new Lot();
            req.doc = lot;
            req.params.id = lot.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(lot)).to.be.true;
                done();
            }
            app.lotController.GetLot(req, res);
        })
    })
    
    describe('CreateLot', function() {
        var emptyLot;
        
        before(function() {
            emptyLot = new Lot().toJSON();
            delete emptyLot.id;
            delete emptyLot._id;    
        })
        
        it('should set the user for the lot', function(done) {
            var lot = Object.assign({}, emptyLot);
            var user = new User();
            lot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            lot.user = user._id;
            req.body.lot = lot;
            req.user = {
                id: user.id
            }
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}])
            res.sendBad = done;
            app.db.lots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj).to.deep.equal(lot);
                    return mockPromise(obj)();
                }
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.lotController.CreateLot(req, res);
        })

        it('should error if no location was provided', function(done) {
            app.db.lots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj).to.deep.equal(emptyLot);
                    return mockPromise(obj)();
                }
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.BadInput)).to.be.true;
                done();
            }
            app.lotController.CreateLot(req, res);
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
                app.lotController.CreateLot(req, res);
            })
        })
        
        it('if couldnt create lot should send error', function(done) {
            app.geocoder.geocode = mockPromise([{formattedAddress: 'some addres', longitude: 12, latitude: 21}])
            app.db.lots = {
                create: mockPromise(null, new Errors.TestError())
            }
            req.body = {
                location: {
                    address: "some address"
                }
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError), JSON.stringify(res.send.firstCall.args[0])).to.be.true;
                done();
            }
            app.lotController.CreateLot(req, res);
        })
        
        it('if couldnt insert entire collection should send error', function(done) {
            app.geocoder.geocode = mockPromise([{formattedAddress: 'some addres', longitude: 12, latitude: 21}])
            app.db.lots = {
                collection: {
                    insert: mockPromise(null, new Errors.TestError())
                }
            }
            req.body = {
                location: {
                    address: 'some addres'
                },
                count: 5
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                done();
            }
            app.lotController.CreateLot(req, res);
        })
        
        it('should create n lots with the given props', function(done) {
            var count = 5;
            var lot = Object.assign({}, emptyLot);
            var arr = [];
            for (var i=0;i<count;i++) {
                delete lot.id;
                delete lot._id;
                arr.push(lot);
            }
            lot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            lot.price = {
                perHour: 123.45
            };
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}])
            app.db.lots = {
                collection: {
                    insert: function(obj) {
                        expect(obj).to.have.length(count);
                        expect(obj[0]).to.have.deep.property('price.perHour');
                        obj[0].price.perHour /= 100;
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
            req.body.lot = lot;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.lotController.CreateLot(req, res);
        })
        
        it('should create a lot with the given props', function(done) {
            var lot = Object.assign({}, emptyLot);
            lot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            lot.price = {
                perHour: 123.45
            };
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.lots = {
                create: function(obj) {
                    expect(obj).to.have.property('price');
                    return mockPromise(obj)();
                }
            }
            req.body.lot = lot;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();    
            }
            app.lotController.CreateLot(req, res);
        })
        
        it('should create a blank lot given no additional params', function(done) {
            var lot = Object.assign({}, emptyLot);
            lot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            req.body.lot = lot;
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.lots = {
                create: function(obj) {
                    delete obj.id;
                    delete obj._id;
                    expect(obj).to.deep.equal(lot);
                    return mockPromise(obj)();
                }
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.lotController.CreateLot(req, res);
        })
        
        it('should create n blank lots given a count n and no additional params', function(done) {
            var lot = Object.assign({}, emptyLot);
            lot.location = {
                address: '123 fake st',
                coordinates: [12,34]
            }
            delete lot.id;
            delete lot._id;
            var count = 5;
            var arr = [];
            for (var i=0;i<count;i++) {
                arr.push(lot);
            }
            app.geocoder.geocode = mockPromise([{formattedAddress: '123 fake st', longitude: 12, latitude: 34}]);
            app.db.lots = {
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
            req.body.lot = lot;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.lotController.CreateLot(req, res);
        })
    })
    



    
    describe('GetLocationOfLot', function() {
        it('should return the lot\'s location', function(done) {
            var l = new Lot();
            l.location.address = '123 fake st';
            l.location.coordinates = [123, 456];
            req.doc = l;
            req.params.id = l.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(JSON.parse(JSON.stringify(l.location))), JSON.stringify(res.send.firstCall.args[0]) + '\n' + JSON.stringify(l.location)).to.be.true;
                done();
            }
            app.lotController.GetLocationOfLot(req, res);
        });
    })
    
    describe('GetSpotsForLot', function(done) {
        it('should return an empty array if no spots are assigned', function(done) {
            var l = new Lot();
            req.doc = l;
            app.db.spots = {
                find: mockPromise([])
            }
            req.params.id = l.id;
            res.sent = function(body) {
                expect(res.sentWith([])).to.be.true;
                done();
            }
            app.lotController.GetSpotsForLot(req, res);
        })
        
        
        it('should return the lot\'s spots', function(done) {
            var l = new Lot();
            req.doc = l;
            var _spot = {
                lot: l
            }
            var expected = [
                new Spot(_spot),
                new Spot(_spot)
            ]
            app.db.spots = {
                find: mockPromise(expected)
            }
            req.params.id = l.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(expected)).to.be.true;
                done();
            }
            app.lotController.GetSpotsForLot(req, res);
        });
    })

    describe('AddAvailabilityToLot', function() {
        it('should fail if given bad input', function(done) {
            var l = new Lot();
            [
                123,
                '123',
                {},
                {badProp: 'some value'},
                function(){expect.fail()}
            ].forEach(function(input, i, arr) {
                req.body = input;
                res.sent = function() {
                    if (res.send.callCount >= arr.length) {
                        expect(res.sendBad.callCount).to.equal(res.send.callCount);
                        done();
                    }
                }                
                app.lotController.AddAvailabilityToLot(req, res);
            })
        })

        it('should add the availability to all spots in the lot', function(done) {
            var l = new Lot();
            var s = new Spot({
                lot: l
            })
            sinon.stub(l, 'addAvailability')
            sinon.stub(s, 'addAvailability')
            req.doc = l;
            app.db.spots = {
                find: mockPromise([s])
            }
            req.body = {
                start: new Date('2000/01/01'),
                end: new Date('2000/01/01')
            }
            req.params.id = l.id;
            res.sent = function() {
                expect(l.addAvailability.calledOnce).to.be.true;
                expect(l.addAvailability.calledWith(req.body)).to.be.true;
                expect(s.addAvailability.calledOnce).to.be.true;
                expect(s.addAvailability.calledWith(req.body)).to.be.true;
                done();
            }
            app.lotController.AddAvailabilityToLot(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.spots = {
                find: mockPromise(null, new Errors.TestError())
            }
            req.body = {
                start: new Date(),
                end: new Date()
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                done();
            }
            app.lotController.AddAvailabilityToLot(req, res);
        })
    })
    
    describe('RemoveAvailabilityFromLot', function() {
        it('should fail if given bad input', function(done) {
            var l = new Lot();
            [
                123,
                '123',
                {},
                {badProp: 'some value'},
                function(){expect.fail()}
            ].forEach(function(input, i, arr) {
                req.body = input;
                res.sent = function() {
                    if (res.send.callCount >= arr.length) {
                        expect(res.sendBad.callCount).to.equal(res.send.callCount);
                        done();
                    }
                }                
                app.lotController.RemoveAvailabilityFromLot(req, res);
            })
        })

        it('should add the availability to all spots in the lot', function(done) {
            var l = new Lot();
            var s = new Spot({
                lot: l
            })
            sinon.stub(l, 'removeAvailability')
            sinon.stub(s, 'removeAvailability')
            req.doc = l;
            app.db.spots = {
                find: mockPromise([s])
            }
            req.body = {
                start: new Date('2000/01/01'),
                end: new Date('2000/01/01')
            }
            req.params.id = l.id;
            res.sent = function() {
                expect(l.removeAvailability.calledOnce).to.be.true;
                expect(l.removeAvailability.calledWith(req.body)).to.be.true;
                expect(s.removeAvailability.calledOnce).to.be.true;
                expect(s.removeAvailability.calledWith(req.body)).to.be.true;
                done();
            }
            app.lotController.RemoveAvailabilityFromLot(req, res);
        })
        
        it('should error if db encountered error', function(done) {
            app.db.spots = {
                find: mockPromise(null, new Errors.TestError())
            }
            req.body = {
                start: new Date(),
                end: new Date()
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                done();
            }
            app.lotController.RemoveAvailabilityFromLot(req, res);
        })
    })

    describe('GetPriceOfLot', function() {
        it('should error if price is not set', function(done) {
            var l = new Lot();
            var price = 123.45;
            req.doc = l;
            req.params.id = l.id;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.lotController.GetPriceOfLot(req, res);
        })

        it('should return the price of the lot', function(done) {
            var l = new Lot();
            var price = 123.45;
            l.price.perHour = price;
            req.doc = l;
            req.params.id = l.id;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({
                    perHour: price
                })).to.be.true;
                done();
            }
            app.lotController.GetPriceOfLot(req, res);
        })
    })
    
    describe('SetPriceOfLot', function() {
        it('should set the price of the lot', function(done) {
            var l = new Lot();
            var pricePerHour = 123.45;
            sinon.stub(l, 'setPrice', mockPromise());
            app.db.spots = {
                find: mockPromise([])
            }
            req.doc = l;
            req.params.id = l.id;
            req.body.perHour = pricePerHour;
            res.sent = function() {
                expect(l.setPrice.calledOnce).to.be.true;
                done();
            }
            app.lotController.SetPriceOfLot(req, res);
        })
    })

    describe('GetAttendantsForLot', function() {
        it('should get the attendants for the spot', function(done) {
            var l = new Lot();
            var attendants = [new User()];
            l.attendants = attendants;
            req.doc = l;
            req.params.id = l.id;
            app.db.users = {
                find: mockPromise(attendants)
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(attendants)).to.be.true;
                done();
            }
            app.lotController.GetAttendantsForLot(req, res);
        })
    });

    describe('AddAttendantsToLot', function() {
        it('should add the attendants to the lot', function(done) {
            var l = new Lot();
            req.doc = l;
            req.params.id = l.id;
            var attendants = [new User()];
            app.db.users = {
                find: mockPromise(attendants)
            }
            sinon.stub(l, 'addAttendants', mockPromise());
            req.body.attendants = attendants;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(l.addAttendants.calledOnce).to.be.true;
                expect(l.addAttendants.calledWith(attendants)).to.be.true;
                done();
            }
            app.lotController.AddAttendantsToLot(req, res);
        })
        
        it('should add the attendants to the spots if necessary', function(done) {
            var l = new Lot();
            req.doc = l;
            req.params.id = l.id;
            var attendants = [new User()];
            var s = new Spot();
            s.lot = l;
            app.db.users = {
                find: mockPromise(attendants)
            }
            app.db.spots = {
                find: mockPromise([s])
            }
            sinon.stub(l, 'addAttendants', mockPromise());
            sinon.stub(s, 'addAttendants', mockPromise());
            req.body.attendants = attendants;
            req.body.updateSpots = true;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(l.addAttendants.calledOnce).to.be.true;
                expect(l.addAttendants.calledWith(attendants)).to.be.true;
                expect(s.addAttendants.calledOnce).to.be.true;
                expect(s.addAttendants.calledWith(attendants)).to.be.true;
                done();
            }
            app.lotController.AddAttendantsToLot(req, res);
        })
    });
    
    describe('GetAllBookingsForLot', function() {
        var l, s;
        beforeEach(function() {
            l = new Lot();
            s = new Spot();
            s.lot = l;
            req.doc = l;
            app.db.spots = {
                find: mockPromise([s])
            }
        })

        it('should return an empty array if no bookings are assigned', function(done) {
            app.db.bookings = {
                find: mockPromise([])
            }
            res.sent = function(body) {
                expect(res.sentWith({bookings: []}))
                done();
            }
            req.params.id = '123';
            app.lotController.GetAllBookingsForLot(req, res);
        })
        
        
        it('should return the lot\'s bookings', function(done) {
            var expected = [
                new Booking(),
                new Booking()
            ]
            app.db.bookings = {
                find: function(search) {
                    expect(search.spot.$in).to.deep.include(s.id);
                    return mockPromise(expected)();
                }
            }
            req.params.id = l.id;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(expected)).to.be.true;
                done();
            }
            app.lotController.GetAllBookingsForLot(req, res);
        });
        
        
    })
    
    describe('AddBookingsToLot', function() {
        var l, s;

        beforeEach(function() {
            l = new Lot();
            s = new Spot();
            s.lot = l;
            req.doc = l;
            app.db.spots = {
                find: mockPromise([s])
            }
        })

        it('should fail if bookings do not have start and end times', function(done) {
            s.price.perHour = 123.45;
            var b = new Booking();
            req.params.id = l.id;
            req.body = b;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.BadInput)).to.be.true;
                done();
            }
            app.lotController.AddBookingsToLot(req, res);
        })

        it('should set the user', function(done) {
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
            req.params.id = l.id;
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
            app.lotController.AddBookingsToLot(req, res);
        })

        it('should create booking object and add them', function(done) {
            s.price.perHour = 123.45;
            var b = new Booking();
            b.start = b.end = new Date();
            sinon.stub(s, 'addBookings', function(_b) {
                expect(_b).to.deep.include(b);
                return mockPromise(s)();
            })
            sinon.stub(Booking.prototype, 'setSpot', mockPromise(b));
            req.params.id = l.id;
            req.body = b;
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(b.setSpot.calledOnce).to.be.true;
                Booking.prototype.setSpot.restore();
                done();
            }
            app.lotController.AddBookingsToLot(req, res);
        })
        
        it('should fail if addBookings failed', function(done) {
            sinon.stub(Booking.prototype, 'setSpot', mockPromise(new Booking()));
            sinon.stub(s, 'addBookings', mockPromise(null, new Errors.TestError()));
            req.params.id = l.id;
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
            app.lotController.AddBookingsToLot(req, res);
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
                app.lotController.AddBookingsToLot(req, res);
            })
        })
        
        
    })
})