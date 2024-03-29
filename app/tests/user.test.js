var expect = require('chai').expect;
var sinon = require('sinon');
var Errors = require('./../errors');
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var auth = routeTest.auth;
var mockPromise = require('./mockPromise');
var server = require('./../server');
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
        
    describe('updateProfile', function() {
        it('should update profile given good input', function() {
            var user = new User();
            var profile = {
                name: 'some new value'
            };
            expect(user.profile.name).to.not.equal(profile.name);
            return user.updateProfile(profile)
            .then(function() {
                expect(user.profile.name).to.equal(profile.name);
            });
        });
        
        it('should only update necessary fields', function() {
            var user = new User();
            user.profile.someProp = 'some value';
            var profile = {
                name: 'some new value',
            };
            expect(user.profile.name).to.not.equal(profile.name);
            expect(user.profile.someProp).to.equal('some value');
            return user.updateProfile(profile)
            .then(function() {
                expect(user.profile.name).to.equal(profile.name);
                expect(user.profile.someProp).to.equal('some value');
            });
        })
        
        it('should throw error when trying to update non-existent field', function() {
            var user = new User();
            var profile = {
                someBadProp: 'some bad value'
            };
            return user.updateProfile(profile)
            .then(function() {
                expect.fail();
            })
            .catch(function(err) {
                expect(err.indexOf('someBadProp')).to.be.at.least(0);
            });
        })
    })
    
    describe('addAuth', function() {
        it ('should populate new auth property when given input', function() {
            var auth = 'some value'
            var user = new User();
            return user.addAuth('twitter', auth)
            .then(function() {
                expect(user.authid.twitter).to.be.ok;
                expect(user.authid.twitter).to.deep.equal(auth);
            });
        });
        
        it('should error on bad `strategy` input', function(done) {
            var user = new User();
            var oUser = user.toJSON();
            var tests = 0;
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function (input, i, arr) {
                user.addAuth(input)
                .then(function() {
                    done(input || 'empty');
                })
                .catch(function(err) {
                    console.log(err);
                    expect(err).to.be.ok;
                    expect(user.toJSON()).to.deep.equal(oUser);
                    if (++tests >= arr.length)
                        done();
                })
            });
        });
        
        it('should error on adding existent strategy', function() {
            var user = new User();
            var auth = 'twitter';
            user.authid[auth] = {};
            var oUser = user.toJSON();
            return user.addAuth(auth)
            .then(function() {
                expect.fail();
            })
            .catch(function() {
                expect(user.toJSON()).to.deep.equal(oUser);
            });
        });
    });
    
    describe('removeAuth', function() {
        it('should remove specified auth', function() {
            var user = new User();
            var auth = 'twitter';
            user.authid[auth] = {};
            return user.removeAuth(auth)
            .then(function() {
                expect(user.authid[auth]).to.be.undefined;
            });
        })
        
        it('should error on bad input', function(done) {
            var user = new User();
            var oUser = user.toJSON();
            var tests = 0;
            [
                null,
                undefined,
                '',
                123,
                function(){}
            ].forEach(function (input, i, arr) {
                user.removeAuth(input)
                .then(function() {
                    done(input || 'empty');
                })
                .catch(function(err) {
                    expect(err).to.be.ok;
                    expect(user.toJSON()).to.deep.equal(oUser);
                    if (++tests >= arr.length)
                        done();
                });
            })
        })
        
        it('should error if specified auth is not found', function() {
            var user = new User();
            var oUser = user.toJSON();
            var auth = 'twitter';
            expect(user.authid[auth]).to.be.undefined;
            return user.removeAuth(auth)
            .then(function() {
                expect.fail();
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(user.toJSON()).to.deep.equal(oUser);
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
            var result = user.getAuth(auth); 
            expect(result).to.deep.equal(authObj);
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
                expect(result).to.be.null;
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
})

routeTest('userController', [
    {
        verb: verbs.GET,
        route: '/api/users',
        method: 'GetAllUsers',
        auth: auth.ADMIN
    }, {
        verb: verbs.GET,
        route: '/api/users/profile',
        method: 'GetProfileOfSessionUser',
        auth: auth.AUTHORIZED
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/lots',
        method: 'GetLotsForUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/spots',
        method: 'GetSpotsForUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/bookings',
        method: 'GetBookingsForUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/profile',
        method: 'GetProfileOfUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.PATCH,
        route: '/api/users/:id/profile',
        method: 'UpdateProfileOfUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/stripe/account',
        method: 'GetStripeAccountForUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/stripe/customer',
        method: 'GetStripeCustomerForUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.PUT,
        route: '/api/users/:id/stripe',
        method: 'UpdateStripeAccountForUser',
        auth: auth.ADMIN
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/stripe/history',
        method: 'GetStripeTransactionsForUser',
        auth: auth.ADMIN
    }
]);

describe('userController', function() {
    
    var inject = server.GetDefaultInjection();
    var app;
        
    var req = {},
        res = {};
    
    beforeEach(function() {
        app = server(inject);
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })
    
    
    
    describe('GetAllUsers', function() {
        it('should return all users', function(done) {
            var users = [new User(), new User()];
            app.db.users.find = mockPromise(users);
            res.sent = function () {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(users)).to.be.true;
                done();
            }
            app.userController.GetAllUsers(null, res);
            
        })
    })
    
    describe('GetProfileOfSessionUser', function() {
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
            req.user = user;
            app.userController.GetProfileOfSessionUser(req, res);
            expect(res.sendGood.calledOnce).to.be.true;
            var args = res.send.firstCall.args[0].data;
            expect(args.name).to.equal(user.profile.name);
            expect(args.authid).to.equal(user.authid);
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
                    expect(profile).to.deep.equal(updateProfile);
                    return mockPromise(user)();
                })
            }
            req.doc = user;
            app.db.users = {
                findById: mockPromise(user)
            }
            req.body = updateProfile;
            res.sent = function() {
                expect(user.updateProfile.calledOnce).to.be.true;
                done();
            }
            app.userController.UpdateProfileOfUser(req, res);
        })
        
        it('should respond with an error if user updateProfile failed', function(done) {
            var updateProfile = {
                name: 'some new value'
            }
            var user = new User({
                profile: {
                    name: 'some value'
                }
            });
            sinon.stub(user, 'updateProfile', mockPromise(null, new Errors.TestError()));
            app.db.users = {
                findById: mockPromise(user)
            }
            req.doc = user;
            req.body = updateProfile;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                done();
            }
            app.userController.UpdateProfileOfUser(req, res);
        })
    })
    
    describe('GetProfileOfUser', function() {
        it('should return user profile', function(done) {
            var user = {
                profile: {
                    someProp: 'some value'
                }
            }
            app.db.users = {
                findById: mockPromise(user)
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(user.profile)).to.be.true;
                done();
            }
            app.userController.GetProfileOfUser(req,res);
        })
    })
    
    describe('GetLotsForUser', function() {
        it('should return user\'s lots', function(done) {
            var user = new User();
            var lot = new Lot({
                user: user.id
            })
            app.db.lots = {
                find: mockPromise([lot])
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith([lot])).to.be.true;
                done();
            }
            app.userController.GetLotsForUser(req, res);
        })
    })
    
    describe('GetSpotsForUser', function() {
        it('should return user\'s spots', function(done) {
            var user = new User();
            var spot = new Spot({
                user: user.id
            })
            app.db.spots = {
                find: mockPromise([spot])
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith([spot])).to.be.true;
                done();
            }
            app.userController.GetSpotsForUser(req, res);
        })
    })
    
    describe('GetBookingsForUser', function() {
        it('should return user\'s bookings', function(done) {
            var user = new User();
            var booking = new Booking({
                user: user.id
            })
            app.db.bookings = {
                find: mockPromise([booking])
            }
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith([booking])).to.be.true;
                done();
            }
            app.userController.GetBookingsForUser(req, res);
        })
    })

    describe('GetStripeAccountForUser', function() {
        it('should get stripe account for user', function(done) {
            var acct = 'abcd123';
            var user = new User()
            user.stripe = { acct }
            app.db.users = {
                findById: mockPromise(user)
            }
            app.stripe = {
                getAccount: mockPromise({
                    id: acct,
                    object: "account"
                })
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({
                    id: acct,
                    object: "account"    
                })).to.be.true;
                done();
            }
            app.userController.GetStripeAccountForUser(req, res);
        })

        it('should error if user does not have a stripe account defined', function(done) {
            var user = new User()
            app.db.users = {
                findById: mockPromise(user)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.userController.GetStripeAccountForUser(req, res)
        })
    })

    describe('GetStripeCustomerForUser', function() {
        it('should get stripe customer for user', function(done) {
            var cus = 'cus_ some id';
            var user = new User()
            user.stripe = { cus }
            app.db.users = {
                findById: mockPromise(user)
            }
            app.stripe = {
                getCustomer: mockPromise({
                    id: cus,
                    object: "customer"
                })
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith({
                    id: cus,
                    object: "customer"    
                })).to.be.true;
                done();
            }
            app.userController.GetStripeCustomerForUser(req, res);
        })

        it('should error if user does not have a stripe account defined', function(done) {
            var user = new User()
            app.db.users = {
                findById: mockPromise(user)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.MissingProperty)).to.be.true;
                done();
            }
            app.userController.GetStripeAccountForUser(req, res)
        })
    })

    describe('UpdateStripeAccountForUser', function() {

        it('should update stripe account for user', function(done) {
            var acct = 'some id'
            var updated_account = {
                id: acct,
                object: "account",
                country: "US"
            }
            var user = new User();
            user.stripe = { acct }
            app.db.users = {
                findById: mockPromise(user)
            }
            app.stripe = {
                updateAccount: mockPromise(updated_account)
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(updated_account)).to.be.true;
                done();
            }
            app.userController.UpdateStripeAccountForUser(req, res);
        })

        it('should create a new stripe account for user if one does not already exist', function(done) {
            var acct = 'some id'
            var updated_account = {
                id: acct,
                object: "account"
            }
            var user = new User();
            app.db.users = {
                findById: mockPromise(user)
            }
            app.stripe = {
                createAccount: mockPromise(updated_account)
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(updated_account)).to.be.true;
                done();
            }
            app.userController.UpdateStripeAccountForUser(req, res);
        })

        it('should update stripe account for user', function(done) {
            var acct = 'some id'
            var updated_account = {
                id: acct,
                object: "account",
                country: "US"
            }
            var user = new User();
            user.stripe = { acct }
            app.db.users = {
                findById: mockPromise(user)
            }
            app.stripe = {
                updateAccount: mockPromise(updated_account)
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(updated_account)).to.be.true;
                done();
            }
            app.userController.UpdateStripeAccountForUser(req, res);
        })
    })

    describe('GetStripeTransactionsForUser', function() {
        it('should get stripe transactions for user', function(done) {
            var user = new User();
            user.stripe = {
                acct: 'some id'
            }
            var transactions = [{id: '123'}, {id: '456'}];
            app.stripe = {
                getHistory: mockPromise(transactions)
            }
            app.db.users = {
                findById: mockPromise(user)
            }
            res.sendBad = done;
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(transactions));
                done();
            }
            app.userController.GetStripeTransactionsForUser(req, res);
        })
    })

})
