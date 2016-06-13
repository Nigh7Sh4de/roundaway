var request = require('supertest');
var sinon = require('sinon');
var expect = require('chai').expect;
var server = require('./server');
var testConnectionString = "mongodb://localhost/roundaway_test"
var expressExtensions = require('./app/express');

var User = require('./app/models/User');
var Lot = require('./app/models/Lot');
var Spot = require('./app/models/Spot');
var Booking = require('./app/models/Booking');

describe('the entire app should not explode', function() {
    var app,
        req,
        res;

    var userProfile = {
        name: 'Nigh7'
    }
    var spot = new Spot(),
        spot2 = new Spot();
    var booking = new Booking(),
        booking2 = new Booking();
    var lot = new Lot(),
        lot2 = new Lot();
    var user = new User({
        lotIds: [lot.id],
        spotIds: [spot.id],
        bookingIds: [booking.id],
        profile: userProfile
    });

    var send200 = function(q, s) {
        s.sendStatus(200);
    }

    before(function(done) {
        var inject = server.GetDefaultInjection(true);
        inject.config.DB_CONNECTION_STRING = testConnectionString;
        inject.helper.checkAuth = function(q,s,n) {n()}
        inject.helper.checkAdmin = function(q,s,n) {n()}
        app = server(inject);
        var todo = 4;
        var calls = 0;
        app.db.connection.on('error', console.error.bind(console, 'connection error:'));
        app.db.connection.once('open', function() {
            var next = function(err ,res) {
                expect(err).to.not.be.ok;
                if (++calls >= todo)
                    done();
            }
            app.db.users.collection.insert([user.toJSON()], next);
            app.db.lots.collection.insert([lot.toJSON(), lot2.toJSON()], next);
            app.db.spots.collection.insert([spot.toJSON(), spot2.toJSON()], next);
            app.db.bookings.collection.insert([booking.toJSON(), booking2.toJSON()], next);
        });
    })

    after(function(done) {
        app.db.connection.db.dropDatabase(done);
    })

    describe('User Controller', function() {
        describe('GET `/api/users`', function() {
            it('should return users in db', function(done) {
                request(app).get('/api/users').end(function(err, res) {
                    expect(res.text).to.contain(user.id);
                    expect(res.status).to.equal(200);
                    done();
                })
            });
        })
        describe('GET /api/users/profile', function() {
            it.skip('should return profile for session user', function(done) {

            })
        })
        describe('GET /api/users/:id/lots', function() {
            it('should return lots for the user', function(done) {
                request(app).get('/api/users/' + user.id + '/lots').end(function(err, res) {
                    expect(res.body.data).to.include(lot.id);
                    expect(res.status).to.equal(200);
                    done();
                })
            })
        })
        describe('PUT /api/users/:id/lots', function() {
            it('should add a lot to the user', function(done) {
                request(app).put('/api/users/' + user.id + '/lots')
                    .send({lots: [lot2.toJSON()]})
                    .end(function(err, res) {
                    expect(res.status, res.body.errors).to.equal(200);
                    app.db.users.findById(user.id, function(err, doc) {
                        expect(doc.lotIds).to.include(lot2.id);
                        done();
                    });
                })
            })
        })
        describe('GET /api/users/:id/spots', function() {
            it('should return spots for the user', function(done) {
                request(app).get('/api/users/' + user.id + '/spots').end(function(err, res) {
                    expect(res.body.data).to.include(spot.id);
                    expect(res.status).to.equal(200);
                    done();
                })
            })
        })
        describe('PUT /api/users/:id/spots', function() {
            it('should add a spot to the user', function(done) {
                request(app).put('/api/users/' + user.id + '/spots')
                    .send({spots: [spot2.toJSON()]})
                    .end(function(err, res) {
                    expect(res.status, res.body.errors).to.equal(200);
                    app.db.users.findById(user.id, function(err, doc) {
                        expect(doc.spotIds).to.include(spot2.id);
                        done();
                    });
                })
            })
        })
        describe('GET /api/users/:id/bookings', function() {
            it('should return bookings for the user', function(done) {
                request(app).get('/api/users/' + user.id + '/bookings').end(function(err, res) {
                    expect(res.body.data).to.include(booking.id);
                    expect(res.status).to.equal(200);
                    done();
                })
            })
        })
        describe('PUT /api/users/:id/bookings', function() {
            it('should add a booking to the user', function(done) {
                request(app).put('/api/users/' + user.id + '/bookings')
                    .send({bookings: [booking2.toJSON()]})
                    .end(function(err, res) {
                    expect(res.status, res.body.errors).to.equal(200);
                    app.db.users.findById(user.id, function(err, doc) {
                        expect(doc.bookingIds).to.include(booking2.id);
                        done();
                    });
                })
            })
        })
        describe('GET /api/users/:id/profile', function() {
            it('should return profile for the user', function(done) {
                request(app).get('/api/users/' + user.id + '/profile').end(function(err, res) {
                    expect(res.body.data).to.deep.equal(userProfile);
                    expect(res.status).to.equal(200);
                    done();
                })
            })
        })
        describe('PATCH /api/users/:id/profile', function() {
            it('should return profile for the user', function(done) {
                request(app).patch('/api/users/' + user.id + '/profile')
                    .send({name: 'Sh4de'})
                    .end(function(err, res) {
                    expect(res.status, res.body.errors).to.equal(200);
                    app.db.users.findById(user.id, function(err, doc) {
                        expect(doc.profile.name).to.deep.equal('Sh4de');
                        done();
                    });
                })
            })
        })
    })

    // routeTest('userController', [
    //     {
    //         verb: verbs.GET,
    //         route: '/api/users',
    //         method: 'GetAllUsers',
    //         dbInjection: function () {
    //             return {
    //                 users: [user.toJSON()]
    //             }
    //         },
    //         output: [user.toJSON()],
    //         ignoreSadPath: true,
    //         ignoreId: true
    //     }, {
    //         verb: verbs.GET,
    //         route: '/api/users/profile',
    //         method: 'GetProfileForSessionUser',
    //         req: {
    //             user: {
    //                 profile: {
    //                     toJSON: function() {
    //                         return {
    //                             someProp: 'some value'
    //                         }
    //                     }
    //                 },
    //                 authid: {
    //                     toJSON: function() {
    //                         return {
    //                             someOtherProp: 'some other value'
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //         output: {
    //             someProp: 'some value',
    //             authid: {
    //                 someOtherProp: 'some other value'
    //             }
    //         },
    //         ignoreId: true,
    //         ignoreAdmin: true
    //     }, {
    //         verb: verbs.GET,
    //         route: '/api/users/:id/lots',
    //         method: 'GetLotsForUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: function () {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         id: routeTest.id,
    //                         lotIds: ['123','456','789']
    //                     })
    //                 }
    //             }
    //         },
    //         output: ['123','456','789']
    //     }
    // //     }, {
    //         verb: verbs.PUT,
    //         route: '/api/users/:id/lots',
    //         method: 'AddLotsToUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             },
    //             lots: {
    //                 find: function(search,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         id: id,
    //                         addLot: function(lots, cb) {
    //                             expect(lots).to.have.length(1);
    //                             expect(lots).to.deep.include({id:'123'});
    //                             cb(null, 1);
    //                         }
    //                     })
    //                 }
    //             },
    //             lots: {
    //                 find: function(search, cb) {
    //                     expect(search._id.$in).to.eql(['123']);
    //                     cb(null, [{
    //                         id: '123'
    //                     }])
    //                 }
    //             }
    //         },
    //         body: {
    //             lots: ['123']
    //         }
    //     }, {
    //         verb: verbs.GET,
    //         route: '/api/users/:id/spots',
    //         method: 'GetSpotsForUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         id: routeTest.id,
    //                         spotIds: ['123','456','789']
    //                     })
    //                 }
    //             }
    //         },
    //         output: ['123','456','789']
    //     }, {
    //         verb: verbs.PUT,
    //         route: '/api/users/:id/spots',
    //         method: 'AddSpotsToUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             },
    //             spots: {
    //                 find: function(search,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         id: id,
    //                         addSpot: function(spots, cb) {
    //                             expect(spots).to.have.length(1);
    //                             expect(spots).to.deep.include({id:'123'});
    //                             cb(null, 1);
    //                         }
    //                     })
    //                 }
    //             },
    //             spots: {
    //                 find: function(search, cb) {
    //                     expect(search._id.$in).to.eql(['123']);
    //                     cb(null, [{
    //                         id: '123'
    //                     }])
    //                 }
    //             }
    //         },
    //         body: {
    //             spots: ['123']
    //         }
    //     }, {
    //         verb: verbs.GET,
    //         route: '/api/users/:id/bookings',
    //         method: 'GetBookingsForUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         id: routeTest.id,
    //                         bookingIds: ['123','456','789']
    //                     })
    //                 }
    //             }
    //         },
    //         output: ['123','456','789']
    //     }, {
    //         verb: verbs.PUT,
    //         route: '/api/users/:id/bookings',
    //         method: 'AddBookingsToUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             },
    //             bookings: {
    //                 find: function(search,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         id: id,
    //                         addBooking: function(bookings, cb) {
    //                             expect(bookings).to.have.length(1);
    //                             expect(bookings).to.deep.include({id:'123'});
    //                             cb(null, 1);
    //                         }
    //                     })
    //                 }
    //             },
    //             bookings: {
    //                 find: function(search, cb) {
    //                     expect(search._id.$in).to.eql(['123']);
    //                     cb(null, [{
    //                         id: '123'
    //                     }])
    //                 }
    //             }
    //         },
    //         body: {
    //             bookings: ['123']
    //         }
    //     }, {
    //         verb: verbs.GET,
    //         route: '/api/users/:id/profile',
    //         method: 'GetProfileForUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         id: routeTest.id,
    //                         profile: {
    //                             someProp: 'some value'   
    //                         }
    //                     })
    //                 }
    //             }
    //         },
    //         output: {someProp: 'some value'}
    //     }, {
    //         verb: verbs.PATCH,
    //         route: '/api/users/:id/profile',
    //         method: 'UpdateProfileForfUser',
    //         sadDbInjection: {
    //             users: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         dbInjection: {
    //             users: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal(routeTest.id);
    //                     cb(null, {
    //                         profile: {},
    //                         updateProfile: function(obj, cb) {
    //                             expect(obj).to.eql({someProp: 'some value'});
    //                             cb(null);
    //                         }
    //                     })
    //                 }
    //             }
    //         },
    //         body: {
    //             someProp: 'some value'
    //         }
    //     }
    // ]);

    // routeTest('authController', [
    //     {
    //         verb: verbs.GET,
    //         route: '/logout',
    //         method: 'Logout',
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/login/google',
    //         method: 'Login',
    //         methodParams: ['google'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/login/google/return',
    //         method: 'LoginReturn',
    //         methodParams: ['google'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/login/facebook',
    //         method: 'Login',
    //         methodParams: ['facebook'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/login/facebook/return',
    //         method: 'LoginReturn',
    //         methodParams: ['facebook'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/connect/google',
    //         method: 'Connect',
    //         methodParams: ['google'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/connect/google/return',
    //         method: 'ConnectReturn',
    //         methodParams: ['google'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/connect/facebook',
    //         method: 'Connect',
    //         methodParams: ['facebook'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/connect/facebook/return',
    //         method: 'ConnectReturn',
    //         methodParams: ['facebook'],
    //         ignoreAdmin: true,
    //         ignoreAuth: true,
    //         ignoreId: true,
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     }
    // ])
    
    // routeTest('bookingController', [
    //     {
    //         verb: verbs.GET,
    //         route: '/api/bookings',
    //         method: 'GetAllBookings',
    //         dbInjection: {
    //             bookings: {
    //                 find: sinon.spy(function(search, cb) {
    //                     expect(search).to.eql({});
    //                     cb(null, [{someProp:'some value'},{someProp:'some other value'}]);
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 find: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: [{someProp:'some value'},{someProp:'some other value'}],
    //         ignoreId: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/bookings/:id',
    //         method: 'GetBooking',
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {someProp:'some value'});
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: {someProp:'some value'}
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/bookings',
    //         method: 'CreateBooking',
    //         dbInjection: {
    //             bookings: {
    //                 create: sinon.spy(function(obj, cb) {
    //                     cb(null, {someProp:'some value'});
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 create: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: { someProp: 'some value'},
    //         ignoreId: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/bookings/:id/spot',
    //         method: 'GetSpotForBooking',
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         getSpot: function() { return '1z2x3c' }
    //                     });
    //                 })
    //             },
    //             spots: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal('1z2x3c');
    //                     cb(null, {someProp: 'some value'});
    //                 }
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: {someProp:'some value'}
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/bookings/:id/spot',
    //         method: 'SetSpotForBooking',
    //         body: {
    //             id: '1z2x3c'
    //         },
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         setSpot: function(spot, finish) {
    //                             expect(spot).to.deep.equal({someProp: 'some value'}); 
    //                             finish();
    //                         }
    //                     });
    //                 })
    //             },
    //             spots: {
    //                 findById: function(id, cb) {
    //                     expect(id).to.equal('1z2x3c');
    //                     cb(null, {someProp: 'some value'});
    //                 }
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             },
    //             spots: {
    //                 findById: function(id, cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/bookings/:id/start',
    //         method: 'GetStartOfBooking',
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         getStart: function() { return new Date('01/01/2000'); }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: new Date('01/01/2000').toJSON()
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/bookings/:id/start',
    //         method: 'SetStartOfBooking',
    //         body: {
    //             start: new Date('01/01/2000')
    //         },
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         setStart: function(date, cb) { 
    //                             expect(date).to.deep.equal(new Date('01/01/2000').toJSON());
    //                             cb();    
    //                         }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb('some error');
    //                 })
    //             }
    //         }
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/bookings/:id/duration',
    //         method: 'GetDurationForBooking',
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         getDuration: function() { return 123456789 }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: 123456789
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/bookings/:id/duration',
    //         method: 'SetDurationForBooking',
    //         body: {
    //             duration: 123456789
    //         },
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         setDuration: function(duration, cb) { 
    //                             expect(duration).to.deep.equal(123456789);
    //                             cb();    
    //                         }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb('some error');
    //                 })
    //             }
    //         }
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/bookings/:id/end',
    //         method: 'GetEndOfBooking',
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         getEnd: function() { return new Date('01/01/2000'); }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: new Date('01/01/2000').toJSON()
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/bookings/:id/end',
    //         method: 'SetEndOfBooking',
    //         body: {
    //             end: new Date('01/01/2000')
    //         },
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         setEnd: function(date, cb) { 
    //                             expect(date).to.deep.equal(new Date('01/01/2000').toJSON());
    //                             cb();
    //                         }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb('some error');
    //                 })
    //             }
    //         }
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/bookings/:id/time',
    //         method: 'GetTimeOfBooking',
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         getEnd: function() { return new Date('01/01/2010'); },
    //                         getStart: function() { return new Date('01/01/2000'); }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: { start: new Date('01/01/2000').toJSON(), end: new Date('01/01/2010').toJSON() }
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/bookings/:id/time',
    //         method: 'SetTimeOfBooking',
    //         body: {
    //             start: new Date('01/01/2000'),
    //             end: new Date('01/01/2010')
    //         },
    //         dbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {
    //                         setEnd: function(date, cb) { 
    //                             expect(date).to.deep.equal(new Date('01/01/2010').toJSON());
    //                             cb();
    //                         },
    //                         setStart: function(date, cb) {
    //                             expect(date).to.deep.equal(new Date('01/01/2000').toJSON());
    //                             cb();
    //                         }
    //                     });
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             bookings: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb('some error');
    //                 })
    //             }
    //         }
    //     }
    // ])

    // routeTest('lotController', [
    //     {
    //         verb: verbs.GET,
    //         route: '/api/lots',
    //         method: 'GetAllLots',
    //         dbInjection: {
    //             lots: {
    //                 find: sinon.spy(function(search, cb) {
    //                     expect(search).to.eql({});
    //                     cb(null, [{someProp:'some value'},{someProp:'some other value'}]);
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             lots: {
    //                 find: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: [{someProp:'some value'},{someProp:'some other value'}],
    //         ignoreId: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/lots/:id',
    //         method: 'GetLot',
    //         dbInjection: {
    //             lots: {
    //                 findById: sinon.spy(function(search, cb) {
    //                     cb(null, {someProp:'some value'});
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             lots: {
    //                 findById: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: {someProp:'some value'}
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/lots',
    //         method: 'CreateLot',
    //         dbInjection: {
    //             lots: {
    //                 create: sinon.spy(function(obj, cb) {
    //                     cb(null, {someProp:'some value'});
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             lots: {
    //                 create: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: { status: 'SUCCESS', result: { someProp: 'some value'} },
    //         ignoreId: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/lots/:id/location',
    //         method: 'GetLocationOfLot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/lots/:id/location',
    //         method: 'SetLocationOfLot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/lots/:id/spots',
    //         method: 'GetSpotsForLot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/lots/:id/spots',
    //         method: 'AddSpotsToLot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.DELETE,
    //         route: '/api/lots/:id/spots',
    //         method: 'RemoveSpotsFromLot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     }
    // ])
    
    // routeTest('spotController', [
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots',
    //         method: 'GetAllSpots',
    //         dbInjection: {
    //             spots: {
    //                 find: sinon.spy(function(search, cb) {
    //                     expect(search).to.eql({});
    //                     cb(null, [{someProp:'some value'},{someProp:'some other value'}]);
    //                 })
    //             }
    //         },
    //         sadDbInjection: {
    //             spots: {
    //                 find: function(id,cb) {
    //                     cb('some error');
    //                 }
    //             }
    //         },
    //         output: [{someProp:'some value'},{someProp:'some other value'}],
    //         ignoreId: true
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/spots',
    //         method: 'CreateSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true,
    //         ignoreId: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots/near',
    //         method: 'GetNearestSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true,
    //         ignoreId: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots/:id',
    //         method: 'GetSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots/:id/location',
    //         method: 'GetLocationForSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.POST,
    //         route: '/api/spots/:id/location',
    //         method: 'SetLocationForSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots/:id/bookings',
    //         method: 'GetAllBookingsForSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/spots/:id/bookings',
    //         method: 'AddBookingsToSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/spots/:id/bookings/remove',
    //         method: 'RemoveBookingsFromSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots/:id/available',
    //         method: 'GetAllAvailabilityForSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/spots/:id/available',
    //         method: 'AddAvailabilityToSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.PUT,
    //         route: '/api/spots/:id/available/remove',
    //         method: 'RemoveAvailabilityFromSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots/:id/booked',
    //         method: 'GetAllBookedTimeForSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     },
    //     {
    //         verb: verbs.GET,
    //         route: '/api/spots/:id/schedule',
    //         method: 'GetEntireScheduleForSpot',
    //         ignoreHappyPath: true,
    //         ignoreSadPath: true
    //     }
    // ])


})