var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var server = require('./../../server');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');

describe('Lot schema', function() {
    before(function() {
        sinon.stub(Lot.prototype, 'save', function(cb) { cb() });
    })
    
    after(function() {
        Lot.prototype.save.restore();
    })
    
    describe('getSpots', function() {
        it('should return the spots attached to the lot', function() {
            var l = new Lot();
            var spots = ['123','456']; 
            l.spots = spots;
            expect(l.getSpots()).to.deep.equal(spots);
        });
        
        it('should return an empty array if no spots are added', function() {
            var l = new Lot();
            var spots = l.getSpots();
            expect(spots).to.be.an.instanceOf(Array);
            expect(spots).to.have.length(0);
        })
    })
    
    describe('addSpots', function() {
        it('should add a list of spots to the array', function(done) {
            var spots = [new Spot(), new Spot()];
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spots, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(spots.length);
                spots.forEach(function(spot) {
                    expect(l.spots).to.include(spot.id);
                })
                done();
            });
        })
        
        it('should add a list of spot ids to the array', function(done) {
            var spots = ['123','456'];
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spots, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(spots.length);
                spots.forEach(function(spot) {
                    expect(l.spots).to.include(spot);
                })
                done();
            });
        })
        
        it('should add a single spot to the array', function(done) {
            var spot = new Spot();
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spot, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(1);
                expect(l.spots).to.include(spot.id);
                done();
            });
        })
        
        it('should add a single spot id to the array', function(done) {
            var spot = '123';
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spot, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(1);
                expect(l.spots).to.include(spot);
                done();
            });
        })
        
        it('should fail if given bad input', function(done) {
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            [
                null,
                undefined,
                123,
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}}
            ].forEach(function(input, i, arr) {
                l.addSpots(input, function(err) {
                    expect(err).to.be.ok;
                    expect(l.spots).to.have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
            
        })
    })
    
    describe('getAddress', function() {
        it('should return the address of the lot', function() {
            var l = new Lot();
            var address = '123 some st'; 
            l.address = address;
            expect(l.getAddress()).to.deep.equal(address);
        });
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
    
    describe('setAddress', function() {
        it('should set address given good input', function(done) {
            var l = new Lot();
            var a = '123 some st';
            expect(l.address).to.not.be.ok;
            l.setAddress(a, function(err) {
                expect(err).to.not.be.ok;
                expect(l.address).to.equal(a);
                done();
            })
        })
        
        it('should fail if given bad input', function(done) {
            var l = new Lot();
            expect(l.address).to.not.be.ok;
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
                l.setAddress(input, function(err) {
                    expect(err).to.be.ok;
                    expect(l.address).to.not.be.ok;
                    if (i+1 >= arr.length)
                        done();
                })
            })
            
        })
        
    });
    
    describe('setLocation', function() {
        it('should set the location given an array', function(done) {
            var l = new Lot();
            var coords = [123, 456];
            l.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members(coords);
                done();
            })
        })
        
        it('should fail given a small array', function(done) {
            var l = new Lot();
            var coords = [123];
            expect(l.location.coordinates).to.have.length(0);
            l.setLocation(coords, function(err) {
                expect(err).to.be.ok;
                expect(l.location.coordinates).to.have.length(0);
                done();
            })
        })
        
        it('should fail given a large array', function(done) {
            var l = new Lot();
            var coords = [123,456,789];
            expect(l.location.coordinates).to.have.length(0);
            l.setLocation(coords, function(err) {
                expect(err).to.be.ok;
                expect(l.location.coordinates).to.have.length(0);
                done();
            })
        })
        
        it('should fail if array does not contain numbers', function(done) {
            var l = new Lot();
            expect(l.location.coordinates).have.length(0);
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
                l.setLocation([input,input], function(err) {
                    expect(err).to.be.ok;
                    expect(l.location.coordinates).have.length(0);
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
            l.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([
                    parseInt(coords_g),
                    parseInt(coords_t)
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
            l.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
        
        it('should fail if not given good input', function(done) {
            var l = new Lot();
            expect(l.location.coordinates).have.length(0);
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
                l.setLocation(input, function(err) {
                    expect(err).to.be.ok;
                    expect(l.location.coordinates).have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
        })
        
        it('should fail if object does not have long lat props', function(done) {
            var l = new Lot();
            expect(l.location.coordinates).to.have.length(0);
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
                l.setLocation({long:input,lat:input}, function(err) {
                    expect(err).to.be.ok;
                    expect(l.location.coordinates).have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
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
            l.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
    })
})

describe.only('lotController', function() {
    describe('route', function() {
        routeTest('lotController', [
            {
                verb: verbs.GET,
                route: '/api/lots',
                method: 'GetAllLots',
                dbInjection: {
                    lots: {
                        find: sinon.spy(function(search, cb) {
                            expect(search).to.eql({});
                            cb(null, [{someProp:'some value'},{someProp:'some other value'}]);
                        })
                    }
                },
                sadDbInjection: {
                    lots: {
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
                route: '/api/lots/:id/location',
                method: 'SetLocationOfLot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            }
        ])
    });
    
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
        
        describe('GetAllLots', function() {
            it('should return all lots', function() {
                var lots = [new Lot(), new Lot()];
                app.db.lots = {
                    find: function(obj, cb) {
                        cb(null, lots);
                    }
                }
                app.lotController.GetAllLots(null, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(lots)).to.be.true;
            })
        })
        
        describe('SetLocationOfLot', function() {
            it('should set location given coordinates', function(done) {
                var l = new Lot();
                sinon.stub(l, 'setLocation', function(l,cb) {
                    cb();
                })
                sinon.stub(l, 'setAddress', function(l,cb) {
                    cb();
                })
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                var coords = [123, 456];
                var address = '123 fake street';
                req.body = {
                    coordinates: coords
                }
                res.sendStatus = function() {
                    expect(l.setLocation.calledOnce).to.be.true;
                    expect(l.setLocation.calledWith(coords)).to.be.true;
                    expect(l.setAddress.calledOnce).to.be.true;
                    expect(l.setAddress.calledWith(address)).to.be.true;
                    expect(res.sendStatus.calledOnce)
                    expect(res.sendStatus.calledWith(200)).to.be.true;    
                    done();
                }
                app.lotController.SetLocationOfLot(req, res);
                
            })
        })
    })
})