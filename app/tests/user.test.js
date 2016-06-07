var expect = require('chai').expect;
var sinon = require('sinon');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
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
                expect(err.indexOf('someBadProp')).to.be.at.least(0);
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
                expect(user.hasLot(input)).to.be.null;
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
                expect(user.hasSpot(input)).to.be.null;
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
                expect(user.hasBooking(input)).to.be.null;
            });
        })
    })
})

describe('userController', function() {
    
    var inject = server.GetDefaultInjection();
    var app;
    
    describe('route', function() {
        routeTest('userController', [
            {
                verb: verbs.GET,
                route: '/api/users',
                method: 'GetAllUsers',
                dbInjection: {
                    users: {
                        find: sinon.spy(function(search, cb) {
                            expect(search).to.eql({});
                            cb(null, [{someProp:'some value'},{someProp:'some other value'}]);
                        })
                    }
                },
                sadDbInjection: {
                    users: {
                        find: function(id,cb) {
                            cb(new Error());
                        }
                    }
                },
                output: [{someProp:'some value'},{someProp:'some other value'}],
                ignoreId: true
            }, {
                verb: verbs.GET,
                route: '/api/users/profile',
                method: 'GetProfileForSessionUser',
                dbInjection: {},
                req: {
                    user: {
                        profile: {
                            toJSON: function() {
                                return {
                                    someProp: 'some value'
                                }
                            }
                        },
                        authid: {
                            toJSON: function() {
                                return {
                                    someOtherProp: 'some other value'
                                }
                            }
                        }
                    }
                },
                output: {
                    someProp: 'some value',
                    authid: {
                        someOtherProp: 'some other value'
                    }
                },
                ignoreId: true,
                ignoreAdmin: true
            }, {
                verb: verbs.GET,
                route: '/api/users/:id/lots',
                method: 'GetLotsForUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                id: routeTest.id,
                                lotIds: ['123','456','789']
                            })
                        }
                    }
                },
                output: ['123','456','789']
            }, {
                verb: verbs.PUT,
                route: '/api/users/:id/lots',
                method: 'AddLotsToUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    },
                    lots: {
                        find: function(search,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                id: id,
                                addLot: function(lots, cb) {
                                    expect(lots).to.have.length(1);
                                    expect(lots).to.deep.include({id:'123'});
                                    cb(null, 1);
                                }
                            })
                        }
                    },
                    lots: {
                        find: function(search, cb) {
                            expect(search._id.$in).to.eql(['123']);
                            cb(null, [{
                                id: '123'
                            }])
                        }
                    }
                },
                body: {
                    lots: ['123']
                }
            }, {
                verb: verbs.GET,
                route: '/api/users/:id/spots',
                method: 'GetSpotsForUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                id: routeTest.id,
                                spotIds: ['123','456','789']
                            })
                        }
                    }
                },
                output: ['123','456','789']
            }, {
                verb: verbs.PUT,
                route: '/api/users/:id/spots',
                method: 'AddSpotsToUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    },
                    spots: {
                        find: function(search,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                id: id,
                                addSpot: function(spots, cb) {
                                    expect(spots).to.have.length(1);
                                    expect(spots).to.deep.include({id:'123'});
                                    cb(null, 1);
                                }
                            })
                        }
                    },
                    spots: {
                        find: function(search, cb) {
                            expect(search._id.$in).to.eql(['123']);
                            cb(null, [{
                                id: '123'
                            }])
                        }
                    }
                },
                body: {
                    spots: ['123']
                }
            }, {
                verb: verbs.GET,
                route: '/api/users/:id/bookings',
                method: 'GetBookingsForUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                id: routeTest.id,
                                bookingIds: ['123','456','789']
                            })
                        }
                    }
                },
                output: ['123','456','789']
            }, {
                verb: verbs.PUT,
                route: '/api/users/:id/bookings',
                method: 'AddBookingsToUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    },
                    bookings: {
                        find: function(search,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                id: id,
                                addBooking: function(bookings, cb) {
                                    expect(bookings).to.have.length(1);
                                    expect(bookings).to.deep.include({id:'123'});
                                    cb(null, 1);
                                }
                            })
                        }
                    },
                    bookings: {
                        find: function(search, cb) {
                            expect(search._id.$in).to.eql(['123']);
                            cb(null, [{
                                id: '123'
                            }])
                        }
                    }
                },
                body: {
                    bookings: ['123']
                }
            }, {
                verb: verbs.GET,
                route: '/api/users/:id/profile',
                method: 'GetProfileForUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                id: routeTest.id,
                                profile: {
                                    someProp: 'some value'   
                                }
                            })
                        }
                    }
                },
                output: {someProp: 'some value'}
            }, {
                verb: verbs.PATCH,
                route: '/api/users/:id/profile',
                method: 'UpdateProfileForfUser',
                sadDbInjection: {
                    users: {
                        findById: function(id,cb) {
                            cb(new Error())
                        }
                    }
                },
                dbInjection: {
                    users: {
                        findById: function(id, cb) {
                            expect(id).to.equal(routeTest.id);
                            cb(null, {
                                profile: {},
                                updateProfile: function(obj, cb) {
                                    expect(obj).to.eql({someProp: 'some value'});
                                    cb(null);
                                }
                            })
                        }
                    }
                },
                body: {
                    someProp: 'some value'
                }
            }
        ]);
        
    })
    
    describe('method', function() {
        var req = {},
            res = {};
        
        beforeEach(function() {
            app = server(inject);
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
        
        
        
        describe('GetAllUsers', function() {
            it('should return all users', function() {
                var users = [new User(), new User()];
                app.db.users.find = function(obj, cb) {
                    cb(null, users);
                }
                app.userController.GetAllUsers(null, res);
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
                req.user = user;
                app.userController.GetProfileForSessionUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.lots = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.lots = lots; 
                app.userController.AddLotsToUser(req, res);
                expect(user.addLot.calledOnce).to.be.true;
                expect(user.addLot.calledWith(lots)).to.be.true;
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(200)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no lots in request body', function() {
                req.body = {};
                app.userController.AddLotsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.lots = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.lots = lots; 
                app.userController.AddLotsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.lots = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, []);
                    })    
                } 
                req.body.lots = lots; 
                app.userController.AddLotsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.spots = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.spots = spots; 
                app.userController.AddSpotsToUser(req, res);
                expect(user.addSpot.calledOnce).to.be.true;
                expect(user.addSpot.calledWith(spots)).to.be.true;
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(200)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
            
            it('should error if no spots in request body', function() {
                req.body = {};
                app.userController.AddSpotsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.spots = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.spots = spots; 
                app.userController.AddSpotsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.spots = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, []);
                    })    
                } 
                req.body.spots = spots; 
                app.userController.AddSpotsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.bookings = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.bookings = bookings; 
                app.userController.AddBookingsToUser(req, res);
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
                app.userController.AddBookingsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.bookings = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, x._id.$in);
                    })    
                } 
                req.body.bookings = bookings; 
                app.userController.AddBookingsToUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.db.bookings = {
                    find: sinon.spy(function(x, cb) {
                        expect(x).to.be.ok;
                        return cb(null, []);
                    })    
                } 
                req.body.bookings = bookings; 
                app.userController.AddBookingsToUser(req, res);
                expect(user.addBooking.callCount).to.equal(0);
                expect(res.status.calledOnce);
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
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
                        expect(profile).to.eql(updateProfile);
                        done();
                    })
                }
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                req.body = updateProfile;
                app.userController.UpdateProfileForfUser(req, res);
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
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                req.body = updateProfile;
                app.userController.UpdateProfileForfUser(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith('some error')).to.be.true;
            })
            
            it('should error if user is not found', function() {
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, null);
                    })
                }
                app.userController.UpdateProfileForfUser(req, res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('GetProfileForUser', function() {
            
            it('should return user profile', function() {
                var user = {
                    profile: {
                        someProp: 'some value'
                    }
                }
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.userController.GetProfileForUser(req,res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(user.profile)).to.be.true;
            })
            
            it('should error on bad id', function() {
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, null);
                    })
                }
                app.userController.GetProfileForUser(req,res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('GetLotsForUser', function() {
            
            it('should return user\'s lots', function() {
                var user = {
                    lotIds: [ '1', '2' ,'3' ]
                }
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.userController.GetLotsForUser(req, res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(user.lotIds)).to.be.true;
            })
            
            it('should error on bad id', function() {
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, null);
                    })
                }
                app.userController.GetLotsForUser(req,res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('GetSpotsForUser', function() {
            
            it('should return user\'s spots', function() {
                var user = {
                    spotIds: [ '1', '2' ,'3' ]
                }
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.userController.GetSpotsForUser(req,res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(user.spotIds)).to.be.true;
            })
            
            it('should error on bad id', function() {
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, null);
                    })
                }
                app.userController.GetSpotsForUser(req,res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
        describe('GetBookingsForUser', function() {
            
            it('should return user\'s spots', function() {
                var user = {
                    bookingIds: [ '1', '2' ,'3' ]
                }
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, user);
                    })
                }
                app.userController.GetBookingsForUser(req,res);
                expect(res.send.calledOnce).to.be.true;
                expect(res.send.calledWith(user.bookingIds)).to.be.true;
            })
            
            it('should error on bad id', function() {
                app.db.users = {
                    findById: sinon.spy(function(id, cb) {
                        expect(id).to.be.ok;
                        return cb(null, null);
                    })
                }
                app.userController.GetBookingsForUser(req,res);
                expect(res.status.calledOnce).to.be.true;
                expect(res.status.calledWith(500)).to.be.true;
                expect(res.send.calledOnce).to.be.true;
            })
        })
        
    })
        
})
