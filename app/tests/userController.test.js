var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('supertest');
var server = require('./../../server');
var inject = server.GetDefaultInjection();
var User = require('./../models/User');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');
var Booking = require('./../models/Booking');

describe('User schema', function() {
    
    before(function() {
        sinon.stub(User.prototype, 'save', function(cb) { cb() });
    })
    
    after(function() {
        User.prototype.save.restore();
    })
    
    describe('addLot', function() {
        it('should add the given lot array to the user', function(done) {
            var lot = new Lot();
            var user = new User();
            expect(user.lotIds).to.be.empty;
            
            user.addLot([lot.id], function(err) {
                expect(err).to.not.be.ok;
                expect(user.lotIds).to.have.length(1).and.to.contain(lot.id);
                done();
            });;
        })
        
        it('should add the given lotId to the user', function(done) {
            var lot = new Lot();
            var user = new User();
            expect(user.lotIds).to.be.empty;
            
            user.addLot(lot.id, function(err) {
                expect(err).to.not.be.ok;
                expect(user.lotIds).to.have.length(1).and.to.contain(lot.id);
                done();
            });;
        });
        
        it('should add the given lot object to the user', function(done) {
            var lot = new Lot();
            var user = new User();
            expect(user.lotIds).to.be.empty;
            
            user.addLot(lot, function(err) {
                expect(err).to.not.be.ok;
                expect(user.lotIds).to.have.length(1).and.to.contain(lot.id);
                done();
            })
        });
        
        it('should error on null input', function(done) {
            var user = new User();
            expect(user.lotIds).to.be.empty;
            user.addLot(undefined, function(err) {
                expect(user.lotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it('should error on null id', function(done) {
            var user = new User();
            var lot = {
                someproperty: 'some value'
            }
            expect(user.lotIds).to.be.empty;
            user.addLot(lot, function(err) {
                expect(user.lotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it ('should error on improper id', function(done) {
            var user = new User();
            var lot = {
                id: {}
            }
            expect(user.lotIds).to.be.empty;
            user.addLot(lot, function(err) {
                expect(user.lotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
    });
    
    describe('addSpot', function() {
        it('should add the given spotId to the user', function(done) {
            var spot = new Spot();
            var user = new User();
            expect(user.spotIds).to.be.empty;
            
            user.addSpot(spot.id, function(err) {
                expect(err).to.not.be.ok;
                expect(user.spotIds).to.have.length(1).and.to.contain(spot.id);
                done();
            });;
        });
        
        it('should add the given spot object to the user', function(done) {
            var spot = new Spot();
            var user = new User();
            expect(user.spotIds).to.be.empty;
            
            user.addSpot(spot, function(err) {
                expect(err).to.not.be.ok;
                expect(user.spotIds).to.have.length(1).and.to.contain(spot.id);
                done();
            })
        });
        
        it('should error on null input', function(done) {
            var user = new User();
            expect(user.spotIds).to.be.empty;
            user.addSpot(undefined, function(err) {
                expect(user.spotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it('should error on null id', function(done) {
            var user = new User();
            var spot = {
                someproperty: 'some value'
            }
            expect(user.spotIds).to.be.empty;
            user.addSpot(spot, function(err) {
                expect(user.spotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it ('should error on improper id', function(done) {
            var user = new User();
            var spot = {
                id: {}
            }
            expect(user.spotIds).to.be.empty;
            user.addSpot(spot, function(err) {
                expect(user.spotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
    });
    
    describe('addBooking', function() {
        it('should add the given bookingId to the user', function(done) {
            var booking = new Booking();
            var user = new User();
            expect(user.bookingIds).to.be.empty;
            
            user.addBooking(booking.id, function(err) {
                expect(err).to.not.be.ok;
                expect(user.bookingIds).to.have.length(1).and.to.contain(booking.id);
                done();
            });;
        });
        
        it('should add the given booking object to the user', function(done) {
            var booking = new Booking();
            var user = new User();
            expect(user.bookingIds).to.be.empty;
            
            user.addBooking(booking, function(err) {
                expect(err).to.not.be.ok;
                expect(user.bookingIds).to.have.length(1).and.to.contain(booking.id);
                done();
            })
        });
        
        it('should error on null input', function(done) {
            var user = new User();
            expect(user.bookingIds).to.be.empty;
            user.addBooking(undefined, function(err) {
                expect(user.bookingIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it('should error on null id', function(done) {
            var user = new User();
            var booking = {
                someproperty: 'some value'
            }
            expect(user.bookingIds).to.be.empty;
            user.addBooking(booking, function(err) {
                expect(user.bookingIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it ('should error on improper id', function(done) {
            var user = new User();
            var booking = {
                id: {}
            }
            expect(user.bookingIds).to.be.empty;
            user.addBooking(booking, function(err) {
                expect(user.bookingIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
    });
    
    describe('setName', function() {
        it('should set name given valid input', function(done) {
            var name = "some name";
            var user = new User();
            
            user.setName(name, function(err) {
                expect(err).to.not.be.ok;
                expect(user.profile.name).to.equal(name);
                done();
            });
            
        })
        
        it('should error given input of wrong type', function(done) {
            var user = new User();
            var oUser = user.toJSON();
            var testInput = [null, undefined, false, 123];
            var counter = 0;
            function assertions(err) {
                if (++counter >= testInput.length)
                    done();
                expect(err).to.be.ok;
                expect(user.toJSON()).to.eql(oUser);
            }
            testInput.forEach(function (input) {
                user.setName(input, assertions);
            })
            
        })
        
        it('should error given empty input', function(done) {
            var user = new User();
            var oUser = user.toJSON();
            var testInput = [''];
            var counter = 0;
            function assertions(err) {
                if (++counter >= testInput.length)
                    done();
                expect(err).to.be.ok;
                expect(user.toJSON()).to.eql(oUser);
            }
            testInput.forEach(function (input) {
                user.setName(input, assertions);
            })
        })
    });
    
    describe('addAuth', function() {
        it('should add auth property', function(done) {
            var user = new User();
            user.addAuth('twitter', function(err) {
                expect(err).to.not.be.ok;
                expect(user.authid.twitter).to.be.ok;
                expect(user.authid.twitter).to.eql({});
                done();
            });
        })
        
        it ('should populate new auth property when given input', function(done) {
            var auth = {
                someProp: 'some value'
            }
            var user = new User();
            user.addAuth('twitter', auth, function(err) {
                expect(err).to.not.be.ok;
                expect(user.authid.twitter).to.be.ok;
                expect(user.authid.twitter).to.eql(auth);
                done();
            });
        });
        
        it('should error on bad `strategy` input', function(done) {
            var user = new User();
            var oUser = user.toJSON();
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function (input, index, arr) {
                user.addAuth(input, function(err) {
                    expect(err).to.be.ok;
                    expect(user.toJSON()).to.eql(oUser);
                    if (index + 1 >= arr.length)
                        done();
                })
            })
        });
        
        it('should error on adding existent strategy', function(done) {
            var user = new User();
            var auth = 'twitter';
            user.authid[auth] = {};
            var oUser = user.toJSON();
            user.addAuth(auth, function(err) {
                expect(err).to.be.ok;
                expect(user.toJSON()).to.eql(oUser);
                done();
            });
        });
    });
    
    describe('removeAuth', function() {
        it('should remove specified auth', function(done) {
            var user = new User();
            var auth = 'twitter';
            user.authid[auth] = {};
            user.removeAuth(auth, function(err) {
                expect(err).to.not.be.ok;
                expect(user.authid[auth]).to.be.undefined;
                done();
            });
        })
        
        it('should error on bad input', function(done) {
            var user = new User();
            var oUser = user.toJSON();
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function (input, i, arr) {
                user.removeAuth(input, function(err) {
                    expect(err).to.be.ok;
                    expect(user.toJSON()).to.eql(oUser);
                    if (i + 1 >= arr.length)
                        done();    
                });
            });
        })
        
        it('should error if specified auth is not found', function(done) {
            var user = new User();
            var oUser = user.toJSON();
            var auth = 'twitter';
            expect(user.authid[auth]).to.be.undefined;
            user.removeAuth(auth, function(err) {
                expect(err).to.be.ok;
                expect(user.toJSON()).to.eql(oUser);
                done();
            });
        })
    })
    
    describe('getAuth', function() {
        it('should get specified auth', function() {
            var user = new User();
            var auth = 'twitter';
            var authObj = {
                someProp: 'somevalue'
            };
            user.authid[auth] = authObj; 
            var result = user.getAuth(auth);//, function(err) {
            expect(result).to.be.authObj;
        })
        
        it('should error on bad input', function() {
            var user = new User();
            var oUser = user.toJSON();
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function (input, i, arr) {
                var result = user.getAuth(input);
                expect(result).to.be.an.instanceOf(Error);
            });
        })
        
        it('should return null if specified auth is not found', function() {
            var user = new User();
            var oUser = user.toJSON();
            var auth = 'twitter';
            expect(user.authid[auth]).to.be.undefined;
            var result = user.getAuth(auth);
            expect(result).to.be.null;
        })
    })
    
    describe('hasLot', function() {
        it('should return true if user has given lot', function() {
            var user = new User();
            var lotId = '1z2x3c4v5b6n7m8';
            var lot = {
                id: lotId
            }
            user.lotIds.push(lotId);
            expect(user.hasLot(lot)).to.be.true;
            expect(user.hasLot(lotId)).to.be.true;
        })
        
        it('should return false if user does not have given lot', function() {
            var user = new User();
            var lotId = '1z2x3c4v5b6n7m8';
            var lot = {
                id: lotId
            }
            expect(user.hasLot(lot)).to.be.false;
            expect(user.hasLot(lotId)).to.be.false;
        })
        
        it ('should error on bad input', function() {
            var user = new User();
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function(input) {
                expect(user.hasLot(input)).to.be.an.instanceOf(Error);
            });
        })
    })
    
    describe('hasSpot', function() {
        it('should return true if user has given spot', function() {
            var user = new User();
            var spotId = '1z2x3c4v5b6n7m8';
            var spot = {
                id: spotId
            }
            user.spotIds.push(spotId);
            expect(user.hasSpot(spot)).to.be.true;
            expect(user.hasSpot(spotId)).to.be.true;
        })
        
        it('should return false if user does not have given spot', function() {
            var user = new User();
            var spotId = '1z2x3c4v5b6n7m8';
            var spot = {
                id: spotId
            }
            expect(user.hasSpot(spot)).to.be.false;
            expect(user.hasSpot(spotId)).to.be.false;
        })
        
        it ('should error on bad input', function() {
            var user = new User();
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function(input) {
                expect(user.hasSpot(input)).to.be.an.instanceOf(Error);
            });
        })
    })
    
    describe('hasBooking', function() {
        it('should return true if user has given booking', function() {
            var user = new User();
            var bookingId = '1z2x3c4v5b6n7m8';
            var booking = {
                id: bookingId
            }
            user.bookingIds.push(bookingId);
            expect(user.hasBooking(booking)).to.be.true;
            expect(user.hasBooking(bookingId)).to.be.true;
        })
        
        it('should return false if user does not have given booking', function() {
            var user = new User();
            var bookingId = '1z2x3c4v5b6n7m8';
            var booking = {
                id: bookingId
            }
            expect(user.hasBooking(booking)).to.be.false;
            expect(user.hasBooking(bookingId)).to.be.false;
        })
        
        it ('should error on bad input', function() {
            var user = new User();
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function(input) {
                expect(user.hasBooking(input)).to.be.an.instanceOf(Error);
            });
        })
    })
})

describe('userController', function() {
    beforeEach(function() {
        inject = new server.GetDefaultInjection();
        inject.userController = Object.assign({}, inject.userController);
        inject.helper = Object.assign({}, inject.helper);
    })
    
    describe('route', function() {
        describe('GET /api/users', function() {
            it('should call correct method', function(done) {
                var funcs = [
                    sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }),
                    sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }),
                    sinon.spy(inject.userController, 'GetAllUsers')
                ] 
                
                request(server(inject)).get('/api/users')
                    .expect(200)
                    .end(function (err) {
                        expect(err).to.not.be.ok;
                        funcs.forEach(function (spy) {
                            expect(spy.calledOnce, spy).to.be.true;
                        })
                        done();
                    })
            })
        })
        
        describe('GET /api/users/profile', function() {
            it('shoulld call correct method', function(done) {
                var funcs = [
                    sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }),
                    sinon.stub(inject.userController, 'GetProfileForSessionUser', 
                        function() {
                            return function(q,s,n) { s.sendStatus(200) }
                        })
                ] 
                
                request(server(inject)).get('/api/users/profile')
                    .expect(200)
                    .end(function (err) {
                        expect(err).to.not.be.ok;
                        funcs.forEach(function (spy) {
                            expect(spy.calledOnce, spy).to.be.true;
                        })
                        done();
                    })
            })
        })
        
        describe('PUT /api/users/:userid/lots', function() {
            it('should call correct method', function(done) {
                var checkAuth = sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); });
                var func = sinon.stub(inject.userController, 'AddLotsToUser', function(q,s) { s.sendStatus(200); });
                var lots = {
                    someProp: 'some value'
                }
                var userId = '1z2x3c4v5b6n7m8';                
                request(server(inject)).put('/api/users/' + userId + '/lots')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(lots))
                    .expect(200)
                    .end(function(err) {
                        expect(err).to.not.be.ok;
                        expect(checkAuth.calledOnce).to.be.true;
                        expect(func.firstCall.args[0].params.userid).to.equal(userId);
                        expect(func.firstCall.args[0].body).to.eql(lots);
                        done();
                    });
            });
        })
    })
    
    
    describe('GetAllUsers', function() {
        it('should return all users', function() {
            var users = [new User(), new User()];
            var app = { db: {} };
            app.db.find = function(collection, obj, cb) {
                cb(null, users);
            }
            var res = {
                send: sinon.spy() 
            } 
            inject.userController.GetAllUsers(app)(null, res);
            expect(res.send.calledOnce).to.be.true;
            expect(res.send.calledWith(users)).to.be.true;
            
        })
    })
    
    describe('GetProfileForSessionUser', function() {
        it('should return session user profile and authid', function() {
            var user = {
                profile: {
                    name: 'some name'
                },
                authid: {
                    twitter: {
                        someProp: 'some value'
                    }
                },
                badProp: 'some value'
            }
            user.profile.toJSON = function() {
                return user.profile;
            }
            user.authid.toJSON = function() {
                return user.authid;
            }
            var req = { user: user }
            var res = { send: sinon.spy() }
            inject.userController.GetProfileForSessionUser()(req, res);
            expect(res.send.calledOnce, 'res.send').to.be.true;
            var args = res.send.firstCall.args[0];
            expect(args.name).to.equal(user.profile.name);
            expect(args.authid).to.equal(user.authid);
        })
    })
    
    
})