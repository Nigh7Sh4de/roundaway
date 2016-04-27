var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var server = require('./../../server');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');

describe('Lot schema', function() {
    before(function() {
        sinon.stub(Lot.prototype, 'save', function(cb) { cb(null, this) });
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
        it('should fail to add a spot that is already in the lot', function(done) {
            var l = new Lot();
            var s = new Spot();
            l.spots.push(s.id);
            l.spotNumbers.push(s.number = 1);
            l.addSpots(s, function(err) {
                expect(err).to.be.ok;
                expect(err).to.have.length(1);
                expect(l.spots).to.have.length(1);
                done();
            })
        })
        
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
    
    describe('removeSpots', function() {
        it('should error if trying to remove a spot that is not in the lot', function(done) {
            var l = new Lot();
            l.removeSpots(new Spot(), function(err, success) {
                expect(err).to.be.ok;
                expect(err).to.have.length(1);
                expect(success).to.have.length(0);
                done();
            })
        })
        
        it('should return a success id array', function(done) {
            var l = new Lot();
            var spot = new Spot();
            l.spots.push(spot.id);
            l.spotNumbers.push(123);
            l.removeSpots(spot, function(err, success) {
                expect(l.spots).to.have.length(0);
                expect(l.spotNumbers).to.have.length(0);
                expect(success).to.have.length(1);
                expect(success).deep.include(spot.id);
                done();
            })
        })
        
        it('should remove the given spot', function(done) {
            var l = new Lot();
            var spot = new Spot();
            l.spots.push(spot.id);
            l.spotNumbers.push(123);
            l.removeSpots(spot, function(err) {
                expect(l.spots).to.have.length(0);
                expect(l.spotNumbers).to.have.length(0);
                done();
            })
        })
        
        it('should remove an array of spots', function(done) {
            var l = new Lot();
            var spots = [new Spot(), new Spot(), new Spot()]
            spots.forEach(function(spot, i) {
                l.spots.push(spot.id);
                l.spotNumbers.push(spot.number = i + 1);
            })
            l.removeSpots(spots, function(err) {
                expect(l.spots).to.have.length(0);
                expect(l.spotNumbers).to.have.length(0);
                done();
            })
        })
        
        it('should error on bad type for each spot', function(done) {
            var l = new Lot();
            var s = new Spot();
            s.number = 1;
            l.spots.push(s.id);
            l.spotNumbers.push(s.number);
            expect(l.spots).to.have.length(1);
            expect(l.spots).to.deep.include(s.id);
            [
                null, 
                undefined,
                123,
                'abc',
                function(){expect.fail()}
            ].forEach(function(input, i, arr) {
                l.removeSpots(input, function(err) {
                    expect(err, 'error').to.be.an.instanceOf(Array);
                    expect(err, 'error').to.have.length(1);
                    expect(l.spots, 'spots').to.have.length(1);
                    expect(l.spots, 'spots').to.deep.include(s.id);
                    if (i + 1 >= arr.length)
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
        
        it('should accept lon as long prop', function(done) {
            var l = new Lot();
            var coords_g = 123;
            var coords_t = 456;
            var coords = {
                lon: coords_g,
                lat: coords_t
        };
            l.setLocation(coords, function(err) {
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
            l.setLocation(coords, function(err) {
                expect(err).to.not.be.ok;
                expect(l.location.coordinates).to.include.all.members([coords_g,coords_t]);
                done();
            })
        })
    })
    
    describe('unClaimSpotNumbers', function() {
        it('should unclaim the specified array of spot numbers', function(done) {
            var l = new Lot();
            var nums = [1,2,3];
            l.spotNumbers = nums;
            l.unClaimSpotNumbers(nums, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spotNumbers).to.not.include.members(nums);
                expect(l.spotNumbers).to.have.length(0);
                done();
            })
        })
        
        it('should unclaim the specified spot number', function(done) {
            var l = new Lot();
            var num = 1;
            l.spotNumbers.push(num);
            l.unClaimSpotNumbers(num, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spotNumbers).to.not.include(num);
                expect(l.spotNumbers).to.have.length(0);
                done();
            })
        })
    })
    
    describe('claimSpotNumbers', function() {
        it('should pass added numbers to callback', function(done) {
            var l = new Lot();
            var nums = [1,2,3];
            expect(l.spotNumbers).to.have.length(0);
            l.claimSpotNumbers(nums, function(err, n) {
                expect(err).to.not.be.ok;
                expect(n).to.include.all.members(nums);
                expect(l.spotNumbers).to.have.length(3);
                done();
            })
        })
        it('should claim next spot number given no input', function(done) {
            var l =  new Lot();
            expect(l.spotNumbers).to.have.length(0);
            l.claimSpotNumbers(null, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spotNumbers).to.have.length(1);
                expect(l.spotNumbers[0]).to.equal(1);
                done();
            })
        })
        
        it('should claim given spot number', function(done) {
            var l =  new Lot();
            var num = 666;
            expect(l.spotNumbers).to.have.length(0);
            l.claimSpotNumbers(num, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spotNumbers).to.have.length(1);
                expect(l.spotNumbers[0]).to.equal(num);
                done();
            })
        })
        
        it('should error if trying to claim taken number', function(done) {
            var l =  new Lot();
            var num = 666;
            l.spotNumbers.push(num);
            expect(l.spotNumbers).to.have.length(1);
            expect(l.spotNumbers[0]).to.equal(num);
            l.claimSpotNumbers(num, function(err) {
                expect(err).to.be.ok;
                expect(l.spotNumbers).to.have.length(1);
                expect(l.spotNumbers[0]).to.equal(num);
                done();
            })
        })
        
        it('should claim multiple spot numbers given an array', function(done) {
            var l =  new Lot();
            var nums = [1, 2, 3, 4, 5];
            expect(l.spotNumbers).to.have.length(0);
            l.claimSpotNumbers(nums, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spotNumbers).to.have.length(nums.length);
                nums.forEach(function(num, i) {
                    expect(l.spotNumbers[i]).to.equal(num);
                });
                done();
            })
        })
        
        it('should still save passing numbers and error failures', function(done) {
            var l = new Lot();
            var nums = [1, 2, 3, 4, 5, 5];
            expect(l.spotNumbers).to.have.length(0);
            l.claimSpotNumbers(nums, function(err) {
                expect(err).to.be.ok;
                expect(err).to.have.length(1);
                expect(l.spotNumbers).to.have.length(nums.length - 1);
                for (var i = 0;i < nums.length - 1; i++)
                    expect(l.spotNumbers[i]).to.equal(nums[i]);
                done();
            })
        })
        
        it('should fail given bad input', function(done) {
            var l = new Lot();
            expect(l.spotNumbers).to.have.length(0);
            [
                {},
                'abc',
                Lot.spotNumbersRange.min - 1,
                Lot.spotNumbersRange.max + 1,
                function(){expect.fail()}
            ].forEach(function(input, i, arr) {
                l.claimSpotNumbers(input, function(err) {
                    expect(err).to.be.ok;
                    expect(l.spotNumbers).to.have.length(0);
                    if (i >= arr.length - 1)
                        done();
                })
            })
        })
    })
})

describe('lotController', function() {
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
                verb: verbs.GET,
                route: '/api/lots/:id',
                method: 'GetLot',
                dbInjection: {
                    lots: {
                        findById: sinon.spy(function(search, cb) {
                            cb(null, {someProp:'some value'});
                        })
                    }
                },
                sadDbInjection: {
                    lots: {
                        findById: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: {someProp:'some value'}
            },
            {
                verb: verbs.GET,
                route: '/api/lots/:id/location',
                method: 'GetLocationOfLot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/lots/:id/location',
                method: 'SetLocationOfLot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/api/lots/:id/spots',
                method: 'GetSpotsForLot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.PUT,
                route: '/api/lots/:id/spots',
                method: 'AddSpotsToLot',
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.DELETE,
                route: '/api/lots/:id/spots',
                method: 'RemoveSpotsFromLot',
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
        
        describe('GetLot', function() {
            it('should get lot with specified id', function() {
                var lot = new Lot();
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(lot.id);
                        cb(null, lot);
                    }
                }
                req.params.id = lot.id;
                app.lotController.GetLot(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(lot)).to.be.true;
            })
            
            it('should error if db encountered error', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
                    }
                }
                app.lotController.GetLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should return error if lot found is null', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, null);
                    }
                }
                app.lotController.GetLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('GetLocationOfLot', function() {
            it('should return the lot\'s location', function() {
                var l = new Lot();
                l.address = '123 fake st';
                l.location.coordinates = [123, 456];
                var expected = {
                    address: l.getAddress(),
                    coordinates: l.getLocation()
                }
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                req.params.id = l.id;
                app.lotController.GetLocationOfLot(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(expected), JSON.stringify(res.send.firstCall.args[0]) + '\n' + JSON.stringify(expected)).to.be.true;
            });
            
            it('should error if db encountered error', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
                    }
                }
                app.lotController.GetLocationOfLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should return error if lot found is null', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, null);
                    }
                }
                app.lotController.GetLocationOfLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('SetLocationOfLot', function() {
            var l = new Lot();
            var coords = {
                long: 123,
                lat: 456
            };
            var address = '123 fake st';
            
            beforeEach(function() {
                l = new Lot();
                sinon.stub(l, 'setLocation', function(l,cb) {
                    cb();
                })
                sinon.stub(l, 'setAddress', function(l,cb) {
                    cb();
                })
                sinon.stub(app.geocoder, 'reverse', function(opt, cb) {
                    expect(opt.lat).to.equal(coords.lat);
                    expect(opt.lon).to.equal(coords.long);
                    cb(null, [{formattedAddress: address}]);
                })
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                req.params.id = l.id;
            })
            
            it('should set location given coordinates as array', function(done) {
                req.body = {
                    coordinates: [coords.lat, coords.long]
                }
                res.sendStatus = function(status) {
                    expect(l.setLocation.calledOnce).to.be.true;
                    expect(l.setLocation.calledWith({lat:coords.lat,lon:coords.long})).to.be.true;
                    expect(l.setAddress.calledOnce).to.be.true;
                    expect(l.setAddress.calledWith(address)).to.be.true;
                    expect(status).to.equal(200);
                    done();
                }
                app.lotController.SetLocationOfLot(req, res);
            })
            
            it('should set location given lon and lat as object', function(done) {
                req.body = {
                    coordinates: {
                        lon: coords.long,
                        lat: coords.lat
                    }
                }
                res.sendStatus = function(status) {
                    expect(l.setLocation.calledOnce).to.be.true;
                    expect(l.setLocation.calledWith({lat:coords.lat,lon:coords.long})).to.be.true;
                    expect(l.setAddress.calledOnce).to.be.true;
                    expect(l.setAddress.calledWith(address)).to.be.true;
                    expect(status).to.equal(200);
                    done();
                }
                app.lotController.SetLocationOfLot(req, res);
            })
            
            it('should set location given long and lat as object', function(done) {
                req.body = {
                    coordinates: {
                        long: coords.long,
                        lat: coords.lat
                    }
                }
                res.sendStatus = function(status) {
                    expect(l.setLocation.calledOnce).to.be.true;
                    expect(l.setLocation.calledWith({lat:coords.lat,lon:coords.long})).to.be.true;
                    expect(l.setAddress.calledOnce).to.be.true;
                    expect(l.setAddress.calledWith(address)).to.be.true;
                    expect(status).to.equal(200);
                    done();
                }
                app.lotController.SetLocationOfLot(req, res);
            })
        })
        
        describe('GetSpotsForLot', function(done) {
            it('should return an empty array if no spots are assigned', function(done) {
                var l = new Lot();
                app.db.lots = {
                    findById: function(id,cb) {
                        return cb(null, l);
                    }
                }
                res.send = function(body) {
                    expect(body).to.be.ok;
                    expect(body).to.have.length(0);
                    done();
                }
                req.params.id = l.id;
                app.lotController.GetSpotsForLot(req, res);
            })
            
            
            it('should return the lot\'s spots', function() {
                var l = new Lot();
                var expected = [
                    new Spot(),
                    new Spot()
                ]
                l.spots = [expected[0].id, expected[1].id];
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        for(var i=0;i<expected.length;i++)
                            if (expected[i].id == id)
                                return cb(null, expected[i]);
                        return cb(new Error('Spot not found'));
                    }
                }
                req.params.id = l.id;
                app.lotController.GetSpotsForLot(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(expected)).to.be.true;
            });
            
            it('should return the lot\'s spots and error messages for failures', function() {
                var l = new Lot();
                var msg = 'Spot not found';
                var expected = [
                    new Spot(),
                    msg
                ]
                l.spots = [expected[0].id, '123'];
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        if (expected[0].id == id)
                            return cb(null, expected[0]);
                        return cb(new Error(msg));
                    }
                }
                req.params.id = l.id;
                app.lotController.GetSpotsForLot(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.firstCall.args[0][0]).to.deep.equal(expected[0]);
                expect(res.send.firstCall.args[0][1]).to.be.a('string');
            });
            
            it('should error if db encountered error', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
                    }
                }
                app.lotController.GetSpotsForLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should return error if lot found is null', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, null);
                    }
                }
                app.lotController.GetSpotsForLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })          
        })
        
        describe('AddSpotsToLot', function(done) {
            afterEach(function() {
                if (Spot.prototype.save.restore != null)
                    Spot.prototype.save.restore()
            })
            
            it('should add the required number of spots given a count', function(done) {
                var l = new Lot();
                sinon.stub(l, 'addSpots', function(spots, cb) {
                    cb(null);
                });
                sinon.stub(l, 'save', function(cb) {
                    cb(null);
                })
                l.location.coordinates = [123, 456];
                var newSpots = [
                    new Spot(), new Spot()
                ]
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                sinon.stub(Spot.prototype, 'save', function(cb) {
                    cb(null, this);
                })
                sinon.stub(l, 'claimSpotNumbers', function(nums, cb) {
                    cb(null, [l.claimSpotNumbers.callCount]);
                })
                req.params.id = l.id;
                req.body = {
                    count: 2
                }
                res.status = function(status) {
                    expect(status).to.equal(200);
                    expect(l.addSpots.calledOnce).to.be.true;
                    expect(l.addSpots.firstCall.args[0]).to.have.length(newSpots.length);
                    l.addSpots.firstCall.args[0].forEach(function(newSpot, i) {
                        expect(newSpot.number).to.equal(i+1);
                        expect(newSpot.location.coordinates).to.deep.equal(l.location.coordinates);
                    })
                    expect(Spot.prototype.save.callCount).to.equal(newSpots.length);
                    done();
                }
                app.lotController.AddSpotsToLot(req, res);
            });
            
            it('should add the specified spots and set spot numbers', function(done) {
                var l = new Lot();
                sinon.stub(l, 'addSpots', function(spots, cb) {
                    cb(null);
                });
                sinon.stub(l, 'save', function(cb) {
                    cb(null);
                })
                l.location.coordinates = [123, 456];
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                sinon.stub(Spot.prototype, 'save', function(cb) {
                    cb(null, this);
                })
                sinon.stub(l, 'claimSpotNumbers', function(nums, cb) {
                    cb(null, [l.claimSpotNumbers.callCount]);
                })
                var newSpots = [
                    new Spot(), new Spot()
                ]
                req.params.id = l.id;
                req.body = {
                    spots: newSpots
                }
                res.status = function(status) {
                    expect(status).to.equal(200);
                    expect(l.addSpots.calledOnce).to.be.true;
                    expect(l.addSpots.firstCall.args[0]).to.have.length(newSpots.length);
                    l.addSpots.firstCall.args[0].forEach(function(newSpot, i) {
                        expect(newSpot.number).to.equal(i+1);
                        expect(newSpot.location.coordinates).to.deep.equal(l.location.coordinates);
                    })
                    expect(Spot.prototype.save.callCount).to.equal(newSpots.length);
                    done();
                }
                app.lotController.AddSpotsToLot(req, res);
            })
            
            it('should add the specified spot ids and set spot numbers', function(done) {
                var l = new Lot();
                sinon.stub(l, 'addSpots', function(spots, cb) {
                    cb(null);
                });
                sinon.stub(l, 'save', function(cb) {
                    cb(null);
                })
                l.location.coordinates = [123, 456];
                app.db.lots = {
                    findById: function(id, cb) {
                        expect(id).to.equal(l.id);
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        var found = false;
                        newSpots.forEach(function(spot) {
                            if (spot.id == id)
                                return found = spot;
                        })
                        if (!found)
                            cb(new Error('Spot not found.'));
                        else
                            cb(null, found);
                    }
                }
                sinon.stub(Spot.prototype, 'save', function(cb) {
                    cb(null, this);
                })
                sinon.stub(l, 'claimSpotNumbers', function(nums, cb) {
                    cb(null, [l.claimSpotNumbers.callCount]);
                })
                var newSpots = [
                    new Spot(), new Spot()
                ]
                req.params.id = l.id;
                req.body = {
                    spots: newSpots.map(function(spot) {
                        return spot.id;
                    })
                }
                res.status = function(status) {
                    expect(status).to.equal(200);
                    expect(l.addSpots.calledOnce).to.be.true;
                    expect(l.addSpots.firstCall.args[0]).to.have.length(newSpots.length);
                    l.addSpots.firstCall.args[0].forEach(function(newSpot, i) {
                        expect(newSpot.number).to.equal(i+1);
                        expect(newSpot.location.coordinates).to.deep.equal(l.location.coordinates);
                    })
                    expect(Spot.prototype.save.callCount).to.equal(newSpots.length);
                    done();
                }
                app.lotController.AddSpotsToLot(req, res);
            })
            
            it('should error if db encountered error', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(new Error(), null);
                    }
                }
                app.lotController.AddSpotsToLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should return error if lot found is null', function() {
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, null);
                    }
                }
                app.lotController.AddSpotsToLot(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            }) 
            
            describe('should return error if malformed body', function() {
                var badBodyTest = function(body) {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    req.body = body;
                    app.lotController.AddSpotsToLot(req, res);
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(500)).to.be.true;
                    expect(res.send.calledOnce).to.be.true;    
                    res.status.reset();
                    res.send.reset();
                }
                
                it('empty', function() {
                    badBodyTest({});
                })
                
                it('bad props', function() {
                    badBodyTest({someProp: 'some value'});
                })
                
                it('bad type for count', function() {
                    [
                        'abc',
                        function(){expect.fail()},
                        null,
                        {}
                    ].forEach(function(input) {
                        badBodyTest({
                            count: input
                        })
                    })
                })
                
                it('bad type for spots array', function() {
                    [
                        {},
                        123,
                        'abc',
                        function(){expect.fail()},
                        null,
                        undefined
                    ].forEach(function(input) {
                        badBodyTest({
                            spots: input
                        })
                    })
                })
                
                it('bad type for spots', function() {
                    [
                        {},
                        123,
                        function(){expect.fail()},
                        null,
                        undefined
                    ].forEach(function(input) {
                        badBodyTest({
                            spots: [input]
                        })
                    })
                })
            })
            
            describe('should return fail when', function() {
                it('could not claimSpotNumbers during count', function() {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    sinon.stub(l, 'claimSpotNumbers', function(num, cb) {
                        cb(new Error('some error'));
                    })
                    req.body = {
                        count: 1
                    }
                    app.lotController.AddSpotsToLot(req,res);
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(500)).to.be.true;
                    expect(res.send.calledOnce).to.be.true;
                    expect(res.send.firstCall.args[0].errors).to.have.length(1);
                })
                
                it('could not save Spot during count', function(done) {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    sinon.stub(l, 'claimSpotNumbers', function(num, cb) {
                        cb(null, 1);
                    })
                    sinon.stub(Spot.prototype, 'save', function(cb) {
                        cb(new Error('some error'));
                    })
                    req.body = {
                        count: 1
                    }
                    res.send = sinon.spy(function() {
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        done();
                    });
                    app.lotController.AddSpotsToLot(req,res);
                })
                
                it('encountered error finding spot during search', function(done) {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(new Error('some error'));
                        }
                    }
                    req.body = {
                        spots: ['123']
                    }
                    res.send = sinon.spy(function() {
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        done();
                    });
                    app.lotController.AddSpotsToLot(req,res);
                })
                
                it('could not find spot during search', function(done) {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, null);
                        }
                    }
                    req.body = {
                        spots: ['123']
                    }
                    res.send = sinon.spy(function() {
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        done();
                    });
                    app.lotController.AddSpotsToLot(req,res);
                })
                
                it('could not claimSpotNumbers during search', function(done) {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, new Spot());
                        }
                    }
                    sinon.stub(l, 'claimSpotNumbers', function(num, cb) {
                        cb(new Error('some error'));
                    })
                    req.body = {
                        spots: ['123']
                    }
                    res.send = sinon.spy(function() {
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        done();
                    });
                    app.lotController.AddSpotsToLot(req,res);
                })
                
                it('could not save Spot during search', function(done) {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, new Spot());
                        }
                    }
                    sinon.stub(l, 'claimSpotNumbers', function(num, cb) {
                        cb(null, 1);
                    })
                    sinon.stub(Spot.prototype, 'save', function(cb) {
                        cb(new Error('some error'));
                    })
                    req.body = {
                        spots: ['123']
                    }
                    res.send = sinon.spy(function() {
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        done();
                    });
                    app.lotController.AddSpotsToLot(req,res);
                })
                
                it('could not addSpots', function(done) {
                    var l = new Lot();
                    var s = new Spot();
                    var number = 123;
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, s);
                        }
                    }
                    sinon.stub(l, 'claimSpotNumbers', function(num, cb) {
                        cb(null, [1]);
                    })
                    sinon.stub(l, 'unClaimSpotNumbers', function(num, cb) {
                        cb(null);
                    })
                    sinon.stub(l, 'addSpots', function(spots, cb) {
                        cb([new Error('some error')]);
                    })
                    sinon.stub(s, 'save', function(cb) {
                        cb(null, this);
                    })
                    req.body = {
                        spots: [s.id]
                    }
                    res.send = sinon.spy(function() {
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        expect(s.number).to.not.be.ok;
                        done();
                    });
                    app.lotController.AddSpotsToLot(req,res);
                })
                
                it('could not save Lot', function(done) {
                    var l = new Lot();
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, new Spot());
                        }
                    }
                    sinon.stub(l, 'claimSpotNumbers', function(num, cb) {
                        cb(null, 1);
                    })
                    sinon.stub(l, 'addSpots', function(spots, cb) {
                        cb(null);
                    })
                    sinon.stub(l, 'save', function(cb) {
                        cb(new Error('some error'));
                    })
                    sinon.stub(Spot.prototype, 'save', function(cb) {
                        cb(null, this);
                    })
                    req.body = {
                        spots: ['123']
                    }
                    res.send = sinon.spy(function() {
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        done();
                    });
                    app.lotController.AddSpotsToLot(req,res);
                })
            })  
            
            it('should still save succesfull spots when others fail', function(done) {
                var l = new Lot();
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        for (var i=0;i<spots.length;i++)
                            if (spots[i].id == id)
                                return cb(null, spots[i]);
                        cb(null, null);
                    }
                }
                sinon.stub(l, 'claimSpotNumbers', function(num, cb) {
                    if (l.claimSpotNumbers.callCount <= 1)
                        cb(null, l.claimSpotNumbers.callCount);
                    else
                        cb(new Error('some error'));
                })
                sinon.stub(l, 'addSpots', function(spots, cb) {
                    expect(spots).to.have.length(1);
                    cb(null);
                })
                sinon.stub(l, 'save', function(cb) {
                    cb(null, this);
                })
                sinon.stub(Spot.prototype, 'save', function(cb) {
                    cb(null, this);
                })
                var spots = [
                    new Spot(),
                    new Spot()
                ]
                req.body = {
                    spots: spots.map(function(spot) {
                        return spot.id;
                    })
                }
                res.send = sinon.spy(function() {
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(200)).to.be.true;
                    expect(res.send.calledOnce).to.be.true;
                    expect(res.send.firstCall.args[0].errors).to.have.length(1);
                    done();
                });
                app.lotController.AddSpotsToLot(req,res);
            })   
        })
        
        describe('RemoveSpotsFromLot', function() {
            it('should remove the given range of spot numbers', function(done) {
                var l = new Lot();
                var spots = [new Spot(), new Spot(), new Spot()]
                spots.forEach(function(s, i) {
                    s.save = sinon.spy(function(cb) {
                        cb(null, this);
                    });
                    s.number = i + 1;
                    s.location = l.location;
                    l.spotNumbers.push(s.number);
                    l.spots.push(s.id);
                })
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        var found = null;
                        spots.forEach(function(s) {
                            if (s.id == id)
                                return found = s;
                        })
                        cb(found == null ? new Error('Could not find spot') : null, found);
                    },
                    find: function(search, cb) {
                        cb(null, [spots[0], spots[1]]);
                    }
                }
                sinon.stub(l, 'save', function(cb) {
                    cb(null, this);
                })
                res.send = sinon.spy(function() {
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(200)).to.be.true;
                    spots.forEach(function(s, i) {
                        if (i < 2) {
                            expect(s.number).to.be.null;
                            expect(l.spotNumbers).to.not.deep.include(i+1);
                            expect(l.spots).to.not.deep.include(s.id);
                            expect(s.save.calledOnce).to.be.true;
                        }
                        else {
                            expect(s.number).to.not.be.null;
                            expect(l.spotNumbers).to.deep.include(s.number);
                            expect(l.spots).to.deep.include(s.id);
                            expect(s.save.callCount).to.equal(0);
                        }
                    })
                    expect(l.save.calledOnce).to.be.true;
                    done();
                });
                req.params.id = l.id;
                req.body = {
                    from: 1,
                    to: 2
                }
                app.lotController.RemoveSpotsFromLot(req, res);
            })
            it('should remove the given spot ids from spots', function(done) {
                var l = new Lot();
                var s = new Spot();
                l.spots.push(s.id);
                s.location = l.location;
                s.number = 1;
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        cb(null, s);
                    }
                }
                sinon.stub(s, 'save', function(cb) {
                    cb(null, this);
                })
                sinon.stub(l, 'save', function(cb) {
                    cb(null, this);
                })
                res.send = sinon.spy(function() {
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(200)).to.be.true;
                    expect(s.number).to.be.null;
                    expect(l.spots).to.have.length(0);
                    expect(l.spotNumbers).to.have.length(0);
                    done();
                });
                req.params.id = l.id;
                req.body.spots = [s.id];
                app.lotController.RemoveSpotsFromLot(req, res);
            })
            
            it('should remove the given spot objects', function(done) {
                var l = new Lot();
                var s = new Spot();
                l.spots.push(s.id);
                s.location = l.location;
                s.number = 1;
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        cb(null, s);
                    }
                }
                sinon.stub(s, 'save', function(cb) {
                    cb(null, this);
                })
                sinon.stub(l, 'save', function(cb) {
                    cb(null, this);
                })
                res.send = sinon.spy(function() {
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(200)).to.be.true;
                    expect(s.number).to.be.null;
                    expect(l.spots).to.have.length(0);
                    expect(l.spotNumbers).to.have.length(0);
                    done();
                });
                req.params.id = l.id;
                req.body.spots = [s];
                app.lotController.RemoveSpotsFromLot(req, res);
            })
            
            it('should return 200 if removeSpots succededs for any spot', function(done) {
                var l = new Lot();
                var s = new Spot();
                var _s = null;
                l.spots.push(s.id);
                s.location = l.location;
                s.number = 1;
                app.db.lots = {
                    findById: function(id, cb) {
                        cb(null, l);
                    }
                }
                app.db.spots = {
                    findById: function(id, cb) {
                        cb(null, s);
                    }
                }
                sinon.stub(s, 'save', function(cb) {
                    cb(null, this);
                })
                sinon.stub(l, 'save', function(cb) {
                    cb(null, this);
                })
                res.send = sinon.spy(function() {
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(200)).to.be.true;
                    expect(s.number).to.be.null;
                    expect(l.spots).to.have.length(0);
                    expect(l.spotNumbers).to.have.length(0);
                    done();
                });
                req.params.id = l.id;
                req.body.spots = [s, _s];
                app.lotController.RemoveSpotsFromLot(req, res);
            });
            
            describe('should error when', function() {
                it('encounters error finding lot', function(done) {
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(new Error('some error'));
                        }
                    }
                    res.send = sinon.spy(function() {
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        done();
                    })
                    app.lotController.RemoveSpotsFromLot(req, res);
                })
                
                it('lot not found', function(done) {
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, null);
                        }
                    }
                    res.send = sinon.spy(function() {
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        done();
                    })
                    app.lotController.RemoveSpotsFromLot(req, res);
                })
                
                it('error finding spot', function(done) {
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, new Lot());
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(new Error('some error'));
                        }                        
                    }
                    req.body.spots = ['123']
                    res.send = sinon.spy(function() {
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        done();
                    })
                    app.lotController.RemoveSpotsFromLot(req, res);
                })
                
                it('spot not found', function(done) {
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, new Lot());
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, null);
                        }                        
                    }
                    req.body.spots = ['123']
                    res.send = sinon.spy(function() {
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        done();
                    })
                    app.lotController.RemoveSpotsFromLot(req, res);
                })
                
                it('could not removeSpots', function(done) {
                    var l = new Lot();
                    sinon.stub(l, 'removeSpots', function(spots, cb) {
                        cb(new Error('some error'));
                    })
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, new Spot());
                        }                        
                    }
                    req.body.spots = ['123']
                    res.send = sinon.spy(function() {
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.calledWith('some error')).to.be.true;
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        done();
                    })
                    app.lotController.RemoveSpotsFromLot(req, res);
                })
                
                it('could not save Spot', function(done) {
                    var l = new Lot();
                    var s = new Spot();
                    sinon.stub(l, 'removeSpots', function(spots, cb) {
                        cb(null, [s.id]);
                    })
                    sinon.stub(s, 'save', function(cb) {
                        cb(new Error('some error'));
                    })
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            cb(null, s);
                        }                        
                    }
                    req.body.spots = ['123']
                    res.send = sinon.spy(function() {
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(500)).to.be.true;
                        done();
                    })
                    app.lotController.RemoveSpotsFromLot(req, res);
                })
            })
            
            describe('should return error if malformed body', function() {
                var badBodyTest = function(body) {
                    var l = new Lot();
                    sinon.stub(l, 'save', function(cb) {
                        cb(null, this);
                    })
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    req.body = body;
                    app.lotController.RemoveSpotsFromLot(req, res);
                    expect(res.status.calledOnce).to.be.true;
                    expect(res.status.calledWith(500)).to.be.true;
                    expect(res.send.calledOnce).to.be.true;    
                    res.status.reset();
                    res.send.reset();
                }
                
                it('empty', function() {
                    badBodyTest({});
                })
                
                it('bad props', function() {
                    badBodyTest({someProp: 'some value'});
                })
                
                it('bad type for from', function() {
                    [
                        'abc',
                        function(){expect.fail()},
                        null,
                        {}
                    ].forEach(function(input) {
                        badBodyTest({
                            from: input,
                            to: 10
                        })
                    })
                })
                
                it('bad type for to', function() {
                    [
                        'abc',
                        function(){expect.fail()},
                        null,
                        {}
                    ].forEach(function(input) {
                        badBodyTest({
                            from: 1,
                            to: input
                        })
                    })
                })
                
                it('too small for from', function() {
                    badBodyTest({
                        from: Lot.spotNumbersRange.min - 1,
                        to: Lot.spotNumbersRange.max
                    })
                })
                
                it('too big for to', function() {
                    badBodyTest({
                        from: Lot.spotNumbersRange.min,
                        to: Lot.spotNumbersRange.max + 1
                    })
                })
                
                it('bad type for spots', function() {
                    [
                        123,
                        function(){expect.fail()},
                        null,
                        undefined
                    ].forEach(function(input) {
                        badBodyTest({
                            spots: [input]
                        })
                    })
                })
            })
            
            it('should still save succesfull updates', function(done) {
                var l = new Lot();
                    var s = new Spot();
                    sinon.stub(l, 'removeSpots', function(spots, cb) {
                        expect(spots).to.have.length(1);
                        cb(null, [s.id]);
                    })
                    sinon.stub(s, 'save', function(cb) {
                        cb(null, this);
                    })
                    app.db.lots = {
                        findById: function(id, cb) {
                            cb(null, l);
                        }
                    }
                    app.db.spots = {
                        findById: function(id, cb) {
                            if (id == s.id)
                                cb(null, s);
                            else
                                cb(new Error('some error'));
                        }                        
                    }
                    req.body.spots = ['123', s.id]
                    res.send = sinon.spy(function() {
                        expect(res.send.calledOnce).to.be.true;
                        expect(res.send.firstCall.args[0].errors).to.have.length(1);
                        expect(res.status.calledOnce).to.be.true;
                        expect(res.status.calledWith(200)).to.be.true;
                        done();
                    })
                    app.lotController.RemoveSpotsFromLot(req, res);
            })
        })
    })
})