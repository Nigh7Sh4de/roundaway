var expect = require('chai').expect;
var sinon = require('sinon');
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var mockPromise = require('./mockPromise');
var server = require('./../../server');
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
        
        it('should error on bad `strategy` input', function() {
            var user = new User();
            var oUser = user.toJSON();
            return Promise.all([
                null,
                undefined,
                '',
                123,
                function(){}
            ].map(function (input) {
                return user.addAuth(input)
            }))
            .then(function() {
                expect.fail();
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(user.toJSON()).to.deep.equal(oUser);
            })
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
        
        it('should error on bad input', function() {
            var user = new User();
            var oUser = user.toJSON();
            return Promise.all([
                null,
                undefined,
                '',
                123,
                function(){}
            ].map(function (input) {
                return user.removeAuth(input);
            })).then(function() {
                expect.fail();
            })
            .catch(function(err) {
                expect(err).to.be.ok;
                expect(user.toJSON()).to.deep.equal(oUser);
            });
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
    
    // describe('hasLot', function() {
    //     it('should return true if user has given lot', function() {
    //         var user = new User();
    //         var lotId = '1z2x3c4v5b6n7m8';
    //         var lot = {
    //             id: lotId
    //         }
    //         user.lotIds.push(lotId);
    //         expect(user.hasLot(lot)).to.be.true;
    //         expect(user.hasLot(lotId)).to.be.true;
    //     })
        
    //     it('should return false if user does not have given lot', function() {
    //         var user = new User();
    //         var lotId = '1z2x3c4v5b6n7m8';
    //         var lot = {
    //             id: lotId
    //         }
    //         expect(user.hasLot(lot)).to.be.false;
    //         expect(user.hasLot(lotId)).to.be.false;
    //     })
        
    //     it ('should error on bad input', function() {
    //         var user = new User();
    //         [
    //             null,
    //             undefined,
    //             '',
    //             123,
    //             function(){}
    //         ].forEach(function(input) {
    //             expect(user.hasLot(input)).to.be.null;
    //         });
    //     })
    // })
    
    // describe('hasSpot', function() {
    //     it('should return true if user has given spot', function() {
    //         var user = new User();
    //         var spotId = '1z2x3c4v5b6n7m8';
    //         var spot = {
    //             id: spotId
    //         }
    //         user.spotIds.push(spotId);
    //         expect(user.hasSpot(spot)).to.be.true;
    //         expect(user.hasSpot(spotId)).to.be.true;
    //     })
        
    //     it('should return false if user does not have given spot', function() {
    //         var user = new User();
    //         var spotId = '1z2x3c4v5b6n7m8';
    //         var spot = {
    //             id: spotId
    //         }
    //         expect(user.hasSpot(spot)).to.be.false;
    //         expect(user.hasSpot(spotId)).to.be.false;
    //     })
        
    //     it ('should error on bad input', function() {
    //         var user = new User();
    //         [
    //             null,
    //             undefined,
    //             '',
    //             123,
    //             function(){}
    //         ].forEach(function(input) {
    //             expect(user.hasSpot(input)).to.be.null;
    //         });
    //     })
    // })
    
    // describe('hasBooking', function() {
    //     it('should return true if user has given booking', function() {
    //         var user = new User();
    //         var bookingId = '1z2x3c4v5b6n7m8';
    //         var booking = {
    //             id: bookingId
    //         }
    //         user.bookingIds.push(bookingId);
    //         expect(user.hasBooking(booking)).to.be.true;
    //         expect(user.hasBooking(bookingId)).to.be.true;
    //     })
        
    //     it('should return false if user does not have given booking', function() {
    //         var user = new User();
    //         var bookingId = '1z2x3c4v5b6n7m8';
    //         var booking = {
    //             id: bookingId
    //         }
    //         expect(user.hasBooking(booking)).to.be.false;
    //         expect(user.hasBooking(bookingId)).to.be.false;
    //     })
        
    //     it ('should error on bad input', function() {
    //         var user = new User();
    //         [
    //             null,
    //             undefined,
    //             '',
    //             123,
    //             function(){}
    //         ].forEach(function(input) {
    //             expect(user.hasBooking(input)).to.be.null;
    //         });
    //     })
    // })
})

routeTest('userController', [
    {
        verb: verbs.GET,
        route: '/api/users',
        method: 'GetAllUsers',
        // dbInjection: function () {
        //     return {
        //         users: [user.toJSON()]
        //     }
        // },
        // output: [user.toJSON()],
        // ignoreSadPath: true,
        ignoreId: true
    }, {
        verb: verbs.GET,
        route: '/api/users/profile',
        method: 'GetProfileForSessionUser',
        // req: {
        //     user: {
        //         profile: {
        //             toJSON: function() {
        //                 return {
        //                     someProp: 'some value'
        //                 }
        //             }
        //         },
        //         authid: {
        //             toJSON: function() {
        //                 return {
        //                     someOtherProp: 'some other value'
        //                 }
        //             }
        //         }
        //     }
        // },
        // output: {
        //     someProp: 'some value',
        //     authid: {
        //         someOtherProp: 'some other value'
        //     }
        // },
        ignoreId: true,
        ignoreAdmin: true
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/lots',
        method: 'GetLotsForUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 id: routeTest.id,
        //                 lotIds: ['123','456','789']
        //             })
        //         }
        //     }
        // },
        // output: ['123','456','789']
    // }, {
    //     verb: verbs.PUT,
    //     route: '/api/users/:id/lots',
    //     method: 'AddLotsToUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     },
        //     lots: {
        //         find: function(search,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 id: id,
        //                 addLot: function(lots, cb) {
        //                     expect(lots).to.have.length(1);
        //                     expect(lots).to.deep.include({id:'123'});
        //                     cb(null, 1);
        //                 }
        //             })
        //         }
        //     },
        //     lots: {
        //         find: function(search, cb) {
        //             expect(search._id.$in).to.deep.equal(['123']);
        //             cb(null, [{
        //                 id: '123'
        //             }])
        //         }
        //     }
        // },
        // body: {
        //     lots: ['123']
        // }
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/spots',
        method: 'GetSpotsForUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 id: routeTest.id,
        //                 spotIds: ['123','456','789']
        //             })
        //         }
        //     }
        // },
        // output: ['123','456','789']
    // }, {
    //     verb: verbs.PUT,
    //     route: '/api/users/:id/spots',
    //     method: 'AddSpotsToUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     },
        //     spots: {
        //         find: function(search,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 id: id,
        //                 addSpot: function(spots, cb) {
        //                     expect(spots).to.have.length(1);
        //                     expect(spots).to.deep.include({id:'123'});
        //                     cb(null, 1);
        //                 }
        //             })
        //         }
        //     },
        //     spots: {
        //         find: function(search, cb) {
        //             expect(search._id.$in).to.deep.equal(['123']);
        //             cb(null, [{
        //                 id: '123'
        //             }])
        //         }
        //     }
        // },
        // body: {
        //     spots: ['123']
        // }
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/bookings',
        method: 'GetBookingsForUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 id: routeTest.id,
        //                 bookingIds: ['123','456','789']
        //             })
        //         }
        //     }
        // },
        // output: ['123','456','789']
    // }, {
    //     verb: verbs.PUT,
    //     route: '/api/users/:id/bookings',
    //     method: 'AddBookingsToUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     },
        //     bookings: {
        //         find: function(search,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 id: id,
        //                 addBooking: function(bookings, cb) {
        //                     expect(bookings).to.have.length(1);
        //                     expect(bookings).to.deep.include({id:'123'});
        //                     cb(null, 1);
        //                 }
        //             })
        //         }
        //     },
        //     bookings: {
        //         find: function(search, cb) {
        //             expect(search._id.$in).to.deep.equal(['123']);
        //             cb(null, [{
        //                 id: '123'
        //             }])
        //         }
        //     }
        // },
        // body: {
        //     bookings: ['123']
        // }
    }, {
        verb: verbs.GET,
        route: '/api/users/:id/profile',
        method: 'GetProfileForUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 id: routeTest.id,
        //                 profile: {
        //                     someProp: 'some value'   
        //                 }
        //             })
        //         }
        //     }
        // },
        // output: {someProp: 'some value'}
    }, {
        verb: verbs.PATCH,
        route: '/api/users/:id/profile',
        method: 'UpdateProfileForfUser',
        // sadDbInjection: {
        //     users: {
        //         findById: function(id,cb) {
        //             cb('some error');
        //         }
        //     }
        // },
        // dbInjection: {
        //     users: {
        //         findById: function(id, cb) {
        //             expect(id).to.equal(routeTest.id);
        //             cb(null, {
        //                 profile: {},
        //                 updateProfile: function(obj, cb) {
        //                     expect(obj).to.deep.equal({someProp: 'some value'});
        //                     cb(null);
        //                 }
        //             })
        //         }
        //     }
        // },
        // body: {
        //     someProp: 'some value'
        // }
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
                expect(res.send.calledOnce).to.be.true;
                expect(res.sentWith(users)).to.be.true;
                done();
            }
            app.userController.GetAllUsers(null, res);
            
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
            req.user = user;
            app.userController.GetProfileForSessionUser(req, res);
            expect(res.send.calledOnce, 'res.send').to.be.true;
            var args = res.send.firstCall.args[0].data;
            expect(args.name).to.equal(user.profile.name);
            expect(args.authid).to.equal(user.authid);
        })
    })
    
    describe('UpdateProfileForfUser', function() {
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
                    done();
                })
            }
            app.db.users = {
                findById: mockPromise(user)
            }
            req.body = updateProfile;
            app.userController.UpdateProfileForfUser(req, res);
        })
        
        it('should respond with an error if user updateProfile failed', function(done) {
            var updateProfile = {
                name: 'some new value'
            }
            var user = {
                profile: {
                    name: 'some value'
                },
                updateProfile: sinon.spy(function(profile, cb) {
                    cb('some error');
                })
            }
            app.db.users = {
                findById: mockPromise(user)
            }
            req.body = updateProfile;
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.userController.UpdateProfileForfUser(req, res);
        })
        
        it('should error if user is not found', function(done) {
            app.db.users = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.sendBad.calledOnce).to.be.true;
                done();
            }
            app.userController.UpdateProfileForfUser(req, res);
        })
    })
    
    describe('GetProfileForUser', function() {
        it('should return user profile', function(done) {
            var user = {
                profile: {
                    someProp: 'some value'
                }
            }
            app.db.users = {
                findById: mockPromise(user)
            }
            res.sent = function() {
                expect(res.send.calledOnce).to.be.true;
                expect(res.sentWith(user.profile)).to.be.true;
                done();
            }
            app.userController.GetProfileForUser(req,res);
        })
        
        it('should error on bad id', function() {
            app.db.users = {
                findById: mockPromise(null)
            }
            res.sent = function() {
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                done();
            }
            app.userController.GetProfileForUser(req,res);
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
})
