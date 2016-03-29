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
            user.addLot(null, function(err) {
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
        
        it('should error if user already has lot', function(done) {
            var id = '123';
            var user = new User();
            user.lotIds.push(id)
            var lot = {
                id: id
            }
            expect(user.lotIds).to.have.length(1);
            user.addLot(lot, function(err) {
                expect(user.lotIds).to.have.length(1);
                expect(err).to.be.ok;
                done();
            });
        })
        
        it('should return the number of successful additions', function(done) {
            var ids = ['123', '456', '789'];
            var user = new User();
            expect(user.lotIds).to.be.empty;
            user.addLot(ids, function(err) {
                expect(user.lotIds).to.have.length(ids.length);
                expect(err).to.not.be.ok;
                done();
            });
        })
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
    
    describe('updateProfile', function() {
        it('should update profile given good input', function(done) {
            var user = new User();
            var profile = {
                name: 'some new value'
            };
            expect(user.profile.name).to.not.equal(profile.name);
            user.updateProfile(profile, function(err) {
                expect(err).to.not.be.ok;
                expect(user.profile.name).to.equal(profile.name);
                done();
            });
        });
        
        it('should only update necessary fields', function(done) {
            var user = new User();
            user.profile.someProp = 'some value';
            var profile = {
                name: 'some new value',
            };
            expect(user.profile.name).to.not.equal(profile.name);
            expect(user.profile.someProp).to.equal('some value');
            user.updateProfile(profile, function(err) {
                expect(err).to.not.be.ok;
                expect(user.profile.name).to.equal(profile.name);
                expect(user.profile.someProp).to.equal('some value');
                done();
            });
        })
        
        it('should throw error when trying to update non-existent field', function(done) {
            var user = new User();
            var profile = {
                someBadProp: 'some bad value'
            };
            user.updateProfile(profile, function(err) {
                expect(err).to.be.ok;
                expect(err.message.indexOf('someBadProp')).to.be.at.least(0);
                done();
            });
        })
    })
    
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
        inject.db = Object.assign({}, inject.db);
    })
    
    describe('route', function() {
        describe('GET /api/users', function() {
            it('should call correct method', function(done) {
                var funcs = [
                    sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }),
                    sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }),
                    sinon.stub(inject.userController, 'GetAllUsers', function(a) { return function(q,s) { s.sendStatus(200) }})
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
                var func = sinon.spy(function(q,s) { s.sendStatus(200) });
                sinon.stub(inject.userController, 'AddLotsToUser', function(a) { return func });
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
        
        describe('PUT /api/users/:userid/spots', function() {
            it('should call correct method', function(done) {
                var checkAuth = sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); });
                var func = sinon.spy(function(q,s) { s.sendStatus(200) });
                sinon.stub(inject.userController, 'AddSpotsToUser', function(a) { return func });
                var spots = {
                    someProp: 'some value'
                }
                
                var userId = '1z2x3c4v5b6n7m8';                
                request(server(inject)).put('/api/users/' + userId + '/spots')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(spots))
                    .expect(200)
                    .end(function(err) {
                        expect(err).to.not.be.ok;
                        expect(checkAuth.calledOnce).to.be.true;
                        expect(func.firstCall.args[0].params.userid).to.equal(userId);
                        expect(func.firstCall.args[0].body).to.eql(spots);
                        done();
                    });
            });
        })
        
        describe('PUT /api/users/:userid/bookings', function() {
            it('should call correct method', function(done) {
                var checkAuth = sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); });
                var func = sinon.spy(function(q,s) { s.sendStatus(200) });
                sinon.stub(inject.userController, 'AddBookingsToUser', function(a) { return func });
                var bookings = {
                    someProp: 'some value'
                }
                
                var userId = '1z2x3c4v5b6n7m8';                
                request(server(inject)).put('/api/users/' + userId + '/bookings')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(bookings))
                    .expect(200)
                    .end(function(err) {
                        expect(err).to.not.be.ok;
                        expect(checkAuth.calledOnce).to.be.true;
                        expect(func.firstCall.args[0].params.userid).to.equal(userId);
                        expect(func.firstCall.args[0].body).to.eql(bookings);
                        done();
                    });
            });
        })
        
        describe('PATCH /api/users/:userid/profile', function() {
            it('should call correct method', function(done) {
                var checkAuth = sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); });
                var func = sinon.spy(function(q,s) { s.sendStatus(200) });
                sinon.stub(inject.userController, 'UpdateProfileOfUser', function(a) { return func });
                var profile = {
                    name: 'some new value'
                }
                
                var userId = '1z2x3c4v5b6n7m8';                
                request(server(inject)).patch('/api/users/' + userId + '/profile')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(profile))
                    .expect(200)
                    .end(function(err) {
                        expect(err).to.not.be.ok;
                        expect(checkAuth.calledOnce).to.be.true;
                        expect(func.firstCall.args[0].params.userid).to.equal(userId);
                        expect(func.firstCall.args[0].body).to.eql(profile);
                        done();
                    });
            });
        })
    })
    
    describe('method', function() {
        var req = {},
            res = {};
        
        beforeEach(function() {
            req = {
                body: {},
                params: {
                    userid: 'user.id'
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
        
        
        
        describe('GetAllUsers', function() {
            it('should return all users', function() {
                var users = [new User(), new User()];
                inject.db.users.find = function(obj, cb) {
                    cb(null, users);
                }
                var res = {
                    send: sinon.spy() 
                }
                var app = server(inject);
                app.userController.GetAllUsers(app)(null, res);
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
        
        describe('AddLotsToUser', function() {
            it('should properly call schema method and return status when no errors', function() {
                var count = 1;
                var user = {
                    addLot: sinon.spy(function(lots, cb) {
                        cb(null, count);
                    }),
                    id: '1z2x3c4v'
                }
                var lots = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.lots = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.lots = lots; 
                inject.userController.AddLotsToUser(server(inject))(req, res);
                expect(user.addLot.calledOnce).to.be.true;
                expect(user.addLot.calledWith(lots)).to.be.true;
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(200)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no lots in request body', function() {
                req.body = {};
                inject.userController.AddLotsToUser(server(inject))(req, res);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no user found', function() {
                var count = 1;
                var user = null;
                var lots = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.lots = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.lots = lots; 
                inject.userController.AddLotsToUser(server(inject))(req, res);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no lots found', function() {
                var count = 1;
                var user = {
                    addLot: sinon.spy(function(lots, cb) {
                        cb(null, count);
                    }),
                    id: '1z2x3c4v'
                }
                var lots = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.lots = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, []);
                    })    
                } 
                req.body.lots = lots; 
                inject.userController.AddLotsToUser(server(inject))(req, res);
                expect(user.addLot.callCount).to.equal(0);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('AddSpotsToUser', function() {
            it('should properly call schema method and return status when no errors', function() {
                var count = 1;
                var user = {
                    addSpot: sinon.spy(function(spots, cb) {
                        cb(null, count);
                    }),
                    id: '1z2x3c4v'
                }
                var spots = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.spots = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.spots = spots; 
                inject.userController.AddSpotsToUser(server(inject))(req, res);
                expect(user.addSpot.calledOnce).to.be.true;
                expect(user.addSpot.calledWith(spots)).to.be.true;
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(200)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no spots in request body', function() {
                req.body = {};
                inject.userController.AddSpotsToUser(server(inject))(req, res);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no user found', function() {
                var count = 1;
                var user = null;
                var spots = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.spots = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.spots = spots; 
                inject.userController.AddSpotsToUser(server(inject))(req, res);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no spots found', function() {
                var count = 1;
                var user = {
                    addSpot: sinon.spy(function(spots, cb) {
                        cb(null, count);
                    }),
                    id: '1z2x3c4v'
                }
                var spots = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.spots = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, []);
                    })    
                } 
                req.body.spots = spots; 
                inject.userController.AddSpotsToUser(server(inject))(req, res);
                expect(user.addSpot.callCount).to.equal(0);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('AddBookingsToUser', function() {
            it('should properly call schema method and return status when no errors', function() {
                var count = 1;
                var user = {
                    addBooking: sinon.spy(function(bookings, cb) {
                        cb(null, count);
                    }),
                    id: '1z2x3c4v'
                }
                var bookings = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.bookings = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.bookings = bookings; 
                inject.userController.AddBookingsToUser(server(inject))(req, res);
                expect(user.addBooking.calledOnce).to.be.true;
                expect(user.addBooking.calledWith(bookings)).to.be.true;
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(200)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no bookings in request body', function() {
                var req = {
                    body: {}
                }
                var res = {
                    status: sinon.spy(function(s) {
                        return this;
                    }),
                    send: sinon.spy()
                }
                inject.userController.AddBookingsToUser(server(inject))(req, res);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no user found', function() {
                var count = 1;
                var user = null;
                var bookings = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.bookings = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.bookings = bookings; 
                inject.userController.AddBookingsToUser(server(inject))(req, res);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no bookings found', function() {
                var count = 1;
                var user = {
                    addBooking: sinon.spy(function(bookings, cb) {
                        cb(null, count);
                    }),
                    id: '1z2x3c4v'
                }
                var bookings = [{
                    id: '123'
                }]
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                inject.db.bookings = {
                    find: sinon.spy(function(x, cb) {
                        return cb(null, []);
                    })    
                } 
                req.body.bookings = bookings; 
                inject.userController.AddBookingsToUser(server(inject))(req, res);
                expect(user.addBooking.callCount).to.equal(0);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('UpdateProfileOfUser', function() {
            it('should call user updateProfile given good input', function(done) {
                var updateProfile = {
                    name: 'some new value'
                }
                var user = {
                    profile: {
                        name: 'some value'
                    },
                    updateProfile: sinon.spy(function(profile, cb) {
                        expect(profile).to.eql(updateProfile);
                        done();
                    })
                }
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                req.body = updateProfile;
                inject.userController.UpdateProfileOfUser(server(inject))(req, res);
            })
            
            it('should respond with an error if user updateProfile failed', function() {
                var updateProfile = {
                    name: 'some new value'
                }
                var user = {
                    profile: {
                        name: 'some value'
                    },
                    updateProfile: sinon.spy(function(profile, cb) {
                        cb(new Error('some error'));
                    })
                }
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, user);
                    })
                }
                req.body = updateProfile;
                inject.userController.UpdateProfileOfUser(server(inject))(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith('some error')).to.be.true;
            })
            
            it('should error if user is not found', function() {
                inject.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        return cb(null, null);
                    })
                }
                inject.userController.UpdateProfileOfUser(server(inject))(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
    })
        
})
