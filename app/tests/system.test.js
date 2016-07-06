var jwt = require('jsonwebtoken');
var request = require('supertest');
var sinon = require('sinon');
var expect = require('chai').expect;
var server = require('./../../server');
var testConnectionString = "mongodb://localhost/roundaway_test"
var expressExtensions = require('./../express');

var User = require('./../models/User');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');
var Booking = require('./../models/Booking');

describe.only('the entire app should not explode', function() {
    var app;

    var userProfile = {
        name: 'Nigh7'
    }
    var userAuth = {
        facebook: 'facebook_auth'
    }
    var sessionUser;
    var token = 'aaa.bbb.ccc';

    before(function(done) {
        sessionUser = new User({
            admin: true,
            profile: userProfile,
            authid: userAuth
        });
        var inject = server.GetDefaultInjection(true);
        inject.config.DB_CONNECTION_STRING = testConnectionString;
        token = jwt.sign({id:sessionUser.id}, inject.config.JWT_SECRET_KEY);
        app = server(inject);
        app.stripe.charge = function(t,a,cb) {
            cb(null, {});
        }
        var todo = 4;
        var calls = 0;
        app.db.connection.on('error', function(err) {
            throw err;
        });
        app.db.connection.once('open', done);
    })

    beforeEach(function(done) {
        sessionUser.isNew = true;
        sessionUser.save(function(err, user) {
            done();
        });
    })

    afterEach(function(done) {
        app.db.connection.db.listCollections().toArray(function(err, names) {
            expect(err).to.not.be.ok;
            if (names.length == 0)
                return done();
            var total = names.length,
                i = 0; 
            var next = function(err) {
                if (err)
                    throw err;
                if (++i >= total)
                    done();
            }
            names.forEach(function(collection_name) {
                collection_name = collection_name.name;
                if (collection_name.indexOf("system.") == -1) 
                    app.db.connection.db.collection(collection_name).drop(next);
                else next();
            })
        });
    })

    var insert = function() {
        var args = Array.prototype.slice.call(arguments);
        var cb = args.pop();
        var total = args.length;
        var i = 0;
        var next = function(err) {
            expect(err, err).to.not.be.ok;
            if (++i >= total)
                cb();
        }
        args.forEach(function(item) {
            item.save(next);
        })
    }

    describe('User Controller', function() {
        describe('GET `/api/users`', function() {
            it('should return users in db', function(done) {
                var user = new User();
                insert(user, function() {
                    request(app).get('/api/users')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                        expect(res.text).to.contain(user.id);
                        expect(res.status).to.equal(200);
                        done();
                    })
                });
            });
        })
        describe('GET /api/users/profile', function() {
            it('should return profile for session user', function(done) {
                request(app).get('/api/users/profile')
                    .set('Authorization', 'JWT ' + token)
                    .end(function(err, res) {
                        expect(err).to.not.be.ok;
                        expect(res.status).to.equal(200);
                        expect(res.text).to.contain.all(userAuth.facebook, userProfile.name);
                        done();
                    })

            })
        })
        describe('GET /api/users/:id/lots', function() {
            it('should return lots for the user', function(done) {
                var lot = new Lot();
                var user = new User({
                    lotIds: [lot.id]
                });
                insert(lot, user, function() {
                    request(app).get('/api/users/' + user.id + '/lots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(res.body.data).to.include(lot.id);
                            expect(res.status).to.equal(200);
                            done();
                        })
                });
            })
        })
        describe('PUT /api/users/:id/lots', function() {
            it('should add a lot to the user', function(done) {
                var user = new User();
                var lot = new Lot();
                insert(user, lot, function() {
                    request(app).put('/api/users/' + user.id + '/lots')
                        .send({lots: [lot.toJSON()]})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                        expect(res.status, res.body.errors).to.equal(200);
                        app.db.users.findById(user.id, function(err, doc) {
                            expect(doc.lotIds).to.include(lot.id);
                            done();
                        });
                    })
                })
            })
        })
        describe('GET /api/users/:id/spots', function() {
            it('should return spots for the user', function(done) {
                var spot = new Spot();
                var user = new User({
                    spotIds: [spot.id]
                });
                insert(user, spot, function() {
                    request(app).get('/api/users/' + user.id + '/spots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(res.body.data).to.include(spot.id);
                            expect(res.status).to.equal(200);
                            done();
                        })
                });
            })
        })
        describe('PUT /api/users/:id/spots', function() {
            it('should add a spot to the user', function(done) {
                var user = new User();
                var spot = new Spot();
                insert(user, spot, function() {
                    request(app).put('/api/users/' + user.id + '/spots')
                        .send({spots: [spot.toJSON()]})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                        expect(res.status, res.body.errors).to.equal(200);
                        app.db.users.findById(user.id, function(err, doc) {
                            expect(doc.spotIds).to.include(spot.id);
                            done();
                        });
                    });
                });
            })
        })
        describe('GET /api/users/:id/bookings', function() {
            it('should return bookings for the user', function(done) {
                var booking = new Booking();
                var user = new User({
                    bookingIds: [booking.id]
                })
                insert(booking, user, function() {
                    request(app).get('/api/users/' + user.id + '/bookings')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(res.body.data).to.include(booking.id);
                            expect(res.status).to.equal(200);
                            done();
                        })
                })
            })
        })
        describe('PUT /api/users/:id/bookings', function() {
            it('should add a booking to the user', function(done) {
                var booking = new Booking();
                var user = new User();
                insert(user, booking, function() {
                    request(app).put('/api/users/' + user.id + '/bookings')
                        .send({bookings: [booking.toJSON()]})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                        expect(res.status, res.body.errors).to.equal(200);
                        app.db.users.findById(user.id, function(err, doc) {
                            expect(doc.bookingIds).to.include(booking.id);
                            done();
                        });
                    });
                });
            })
        })
        describe('GET /api/users/:id/profile', function() {
            it('should return profile for the user', function(done) {
                var user = new User({
                    profile: userProfile
                });
                insert(user, function() {
                    request(app).get('/api/users/' + user.id + '/profile')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(res.body.data).to.deep.equal(userProfile);
                            expect(res.status).to.equal(200);
                            done();
                        });
                });
            })
        })
        describe('PATCH /api/users/:id/profile', function() {
            it('should return profile for the user', function(done) {
                var user = new User({
                    profile: userProfile
                })
                insert(user, function() {
                    request(app).patch('/api/users/' + user.id + '/profile')
                        .send({name: 'Sh4de'})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(res.status, res.body.errors).to.equal(200);
                            app.db.users.findById(user.id, function(err, doc) {
                                expect(doc.profile.name).to.deep.equal('Sh4de');
                                done();
                            });
                    });
                });
            })
        })
    })

    describe('Booking controller', function() {
        describe('GET /api/bookings', function() {
            it('should return all bookings', function(done) {
                var booking = new Booking(),
                    booking2 = new Booking();
                insert(booking, booking, function() {
                    request(app).get('/api/bookings')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain.all(booking.id, booking2.id);
                            done();
                        })
                })
            })
        })
        describe('GET /api/bookings/:id', function() {
            it('should return specific booking', function(done) {
                var booking = new Booking();
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain(booking.id);
                            done();
                        })
                })
            })
        })
        describe('PUT /api/bookings', function() {
            it('should create a new booking', function(done) {
                request(app).put('/api/bookings')
                    .set('Authorization', 'JWT ' + token)
                    .end(function(err, res) {
                        expect(err).to.not.be.ok;
                        expect(res.status).to.equal(200);
                        expect(res.body.data).to.be.ok;
                        app.db.bookings.findById(res.body.data._id, function(err, doc) {
                            expect(err).to.not.be.ok;
                            expect(doc).to.be.ok;
                            doc.remove(function(err, res) {
                                expect(err).to.not.be.ok;
                                done();
                            })
                        })
                    })
            })
        })
        describe('GET /api/bookings/:id/spot', function() {
            it('should return spot for the booking', function(done) {
                var spot = new Spot();
                var booking = new Booking({
                    spot: spot.id
                });
                insert(spot, booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/spot')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain(spot.id);
                            done();
                        });
                })
            })
        })
        describe('PUT /api/bookings/:id/spot', function(done) {
            it('should set the spot for the booking', function(done) {
                var spot = new Spot();
                spot.price.perHour = 123.45;
                var booking = new Booking();
                insert(spot, booking, function() {
                    request(app).put('/api/bookings/' + booking.id + '/spot')
                        .send({id: spot.id})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.bookings.findById(booking.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.spot).to.deep.equal(spot.id);
                                done();
                            })
                        })
                });
            })
        })
        describe('GET /api/bookings/:id/start', function() {
            it('should get the start of the booking', function(done) {
                var start = new Date();
                var booking = new Booking({
                    start: start
                })
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/start')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data).to.deep.equal(booking.start.toISOString());
                            done();
                        })
                });
            })
        })
        describe('PUT /api/bookings/:id/start', function() {
            it('should set the start of the booking', function(done) {
                var now = new Date();
                var booking = new Booking();
                insert(booking, function() {

                    request(app).put('/api/bookings/' + booking.id + '/start')
                        .send({start: now})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.bookings.findById(booking.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.start).to.deep.equal(now);
                                done();
                            })
                        })
                })
            })
        })
        describe('GET /api/bookings/:id/end', function() {
            it('should get the end of the booking', function(done) {
                var booking = new Booking({
                    end: new Date()
                });
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/end')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data).to.deep.equal(booking.end.toISOString());
                            done();
                        })
                })
            })
        })
        describe('PUT /api/bookings/:id/end', function() {
            it('should set the end of the booking', function(done) {
                var later = new Date(new Date() + 12345678);
                var booking = new Booking();
                insert(booking, function() {
                    request(app).put('/api/bookings/' + booking.id + '/end')
                        .send({end: later})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.bookings.findById(booking.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.end).to.deep.equal(later);
                                done();
                            })
                        })
                })
            })
        })
        describe('GET /api/bookings/:id/duration', function() {
            it('should get the duration of the booking', function(done) {
                var booking = new Booking({
                    start: new Date('2000/01/01'),
                    end: new Date('2050/01/01')
                })
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/duration')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data).to.deep.equal(booking.getDuration());
                            done();
                        })
                })
            })
        })
        describe('PUT /api/bookings/:id/duration', function() {
            it('should set the duration of the booking', function(done) {
                var oneday = 1000*60*60*24;
                var booking = new Booking({
                    start: new Date('2000/01/01'),
                    end: new Date('2050/01/01')
                })
                insert(booking, function() {
                    request(app).put('/api/bookings/' + booking.id + '/duration')
                        .send({duration: oneday})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.bookings.findById(booking.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.getDuration()).to.deep.equal(oneday);
                                done();
                            })
                        })
                });
            })
        })
        describe('GET /api/bookings/:id/time', function() {
            it('should get the time of the booking', function(done) {
                var booking = new Booking({
                    start: new Date('2000/01/01'),
                    end: new Date('2050/01/01')
                })
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/time')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data).to.be.ok;
                            expect(res.body.data.start).to.deep.equal(booking.start.toISOString());
                            expect(res.body.data.end).to.deep.equal(booking.end.toISOString());
                            done();
                        })
                });
            })
        })
        describe('PUT /api/bookings/:id/time', function() {
            it('should set the time of the booking', function(done) {
                var now = new Date();
                var later = new Date(now + 12345678);
                var booking = new Booking();
                insert(booking, function() {
                    request(app).put('/api/bookings/' + booking.id + '/time')
                        .send({start: now, end: later})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.bookings.findById(booking.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.start).to.deep.equal(now);
                                expect(doc.end).to.deep.equal(later);
                                done();
                            })
                        })
                })
            })
        })
        describe('GET /api/bookings/:id/price', function() {
            it('should get the price of the booking', function(done) {
                var price = 123.45;
                var booking = new Booking({
                    start: new Date('2000/01/01'),
                    end: new Date('2050/01/01'),
                    price: price
                })
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/price')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data).to.equal(price);
                            done();
                        })
                });
            })
        })
        describe('PUT /api/bookings/:id/price', function() {
            it('should get the price of the booking', function(done) {
                var price = 123.45;
                var booking = new Booking({
                    start: new Date('2000/01/01'),
                    end: new Date('2050/01/01'),
                    price: price
                })
                request('')
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/price')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data).to.equal(price);
                            done();
                        })
                });
            })
        })
    })

    describe('Lot Controller', function() {
        describe('GET /api/lots', function() {
            it('should return all lots', function(done) {
                var lot = new Lot(),
                    lot2 = new Lot();
                insert(lot, lot2, function() {
                    request(app).get('/api/lots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain.all(lot.id, lot2.id);
                            done();
                        })
                })
            })
        })
        describe('GET /api/lots/:id', function() {
            it('should return specific lot', function(done) {
                var lot = new Lot();
                insert(lot, function() {
                    request(app).get('/api/lots/' + lot.id)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain(lot.id);
                            done();
                        })
                })
            })
        })
        describe('PUT /api/lots', function() {
            it('should create a new lot', function(done) {
                request(app).put('/api/lots')
                    .set('Authorization', 'JWT ' + token)
                    .end(function(err, res) {
                        expect(err).to.not.be.ok;
                        expect(res.status).to.equal(200);
                        expect(res.body.data).to.be.ok;
                        app.db.lots.findById(res.body.data._id, function(err, doc) {
                            expect(err).to.not.be.ok;
                            expect(doc).to.be.ok;
                            doc.remove(function(err, res) {
                                expect(err).to.not.be.ok;
                                done();
                            })
                        })
                    })
            })
        })
        describe('GET /api/lots/:id/location', function() {
            it('should return location for the lot', function(done) {
                var lot = new Lot();
                lot.location.coordinates = [12, 34];
                insert(lot, function() {
                    request(app).get('/api/lots/' + lot.id + '/location')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain(lot.location.coordinates.toString());
                            done();
                        });
                })
            })
        })
        describe('PUT /api/lots/:id/location', function() {
            it('should set coordinates', function(done) {
                var coords = [12, 21];
                var lot = new Lot();
                insert(lot, function() {
                    request(app).put('/api/lots/' + lot.id + '/location')
                    .send({coordinates: coords})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.lots.findById(lot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.location.coordinates).to.deep.include.all.members(coords);
                                done();
                            });
                        });
                })
            })
        })
        describe('GET /api/lots/:id/spots', function() {
            it('should return spot for the lot', function(done) {
                var spot = new Spot();
                var lot = new Lot({
                    spots: [spot.id]
                })
                insert(spot, lot, function() {
                    request(app).get('/api/lots/' + lot.id + '/spots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain.all(spot.id, spot.id);
                            done();
                        });
                })
            })
        })
        describe('PUT /api/lots/:id/spots', function(done) {
            it('should set the spot for the lot', function(done) {
                var spot = new Spot();
                var lot = new Lot();
                insert(spot, lot, function() {
                    request(app).put('/api/lots/' + lot.id + '/spots')
                        .send({spots: [spot.id]})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.lots.findById(lot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.spots).to.deep.include(spot.id);
                                done();
                            })
                        })
                })
            })
        })
        describe('PUT /api/lots/:id/spots/remove', function(done) {
            it('shouldremove the spot from the lot', function(done) {
                var spot = new Spot();
                var spot2 = new Spot();
                var lot = new Lot({
                    spots: [spot.id, spot2.id]
                })
                insert(lot, spot, function() {
                    request(app).put('/api/lots/' + lot.id + '/spots/remove')
                        .send({spots: [spot.id]})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.lots.findById(lot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.spots).to.deep.include(spot2.id);
                                expect(doc.spots).to.not.deep.include(spot.id);
                                doc.addSpots(spot, function(err) {
                                    expect(err).to.not.be.ok;
                                    done();
                                })
                            })
                        })
                })
            })
        })
    })

    describe('Spot Controller', function() {
        describe('GET /api/spots', function() {
            it('should return all spots', function(done) {
                var spot = new Spot(),
                    spot2 = new Spot();
                insert(spot, spot2, function() {
                    request(app).get('/api/spots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain.all(spot.id, spot2.id);
                            done();
                        })
                })
            })
        })
        describe('GET /api/spots/:id', function() {
            it('should return specific spot', function(done) {
                var spot = new Spot();
                insert(spot, function() {
                    request(app).get('/api/spots/' + spot.id)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain(spot.id);
                            done();
                        })
                })
            })
        })
        describe('PUT /api/spots', function() {
            it('should create a new spot', function(done) {
                request(app).put('/api/spots')
                    .set('Authorization', 'JWT ' + token)
                    .end(function(err, res) {
                        expect(err).to.not.be.ok;
                        expect(res.status).to.equal(200);
                        expect(res.body.data).to.be.ok;
                        app.db.spots.findById(res.body.data._id, function(err, doc) {
                            expect(err).to.not.be.ok;
                            expect(doc).to.be.ok;
                            doc.remove(function(err, res) {
                                expect(err).to.not.be.ok;
                                done();
                            })
                        })
                    })
            })
        })
        describe('GET /api/spots/:id/location', function() {
            it('should return location for the spot', function(done) {
                var spot = new Spot();
                spot.location.coordinates = [12, 34];
                insert(spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/location')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain(spot.location.coordinates.toString());
                            done();
                        });
                })
            })
        })
        describe('PUT /api/spots/:id/location', function() {
            it('should set coordinates', function(done) {
                var coords = [12, 21];
                var spot = new Spot();
                insert(spot, function() {
                    request(app).post('/api/spots/' + spot.id + '/location')
                    .send({coordinates: coords})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.spots.findById(spot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.location.coordinates).to.deep.include.all.members(coords);
                                done();
                            });
                        });
                })
            })
        })
        describe('GET /api/spots/:id/bookings', function() {
            it('should get bookings', function(done) {
                var booking = new Booking();
                var spot = new Spot({
                    bookings: [booking.id]
                });
                insert(booking, spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/bookings')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain(booking.id);
                            done();
                        })
                })
            })
        })
        describe('PUT /api/spots/:id/bookings', function() {
            it('should add bookings', function(done) {
                var spot = new Spot();
                spot.available.addRange(
                    new Date('2000/01/01'),
                    new Date('2100/01/01')
                );
                spot.price.perHour = 123.45;
                var booking = new Booking({
                    start: new Date('2040/01/01'),
                    end: new Date('2050/01/01')
                });
                insert(spot, booking, function() {
                    request(app).put('/api/spots/' + spot.id + '/bookings')
                    .send({bookings: booking.id})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.spots.findById(spot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.bookings).to.include(booking.id);
                                done();
                            })
                        })
                })
            })
        })
        describe('PUT /api/spots/:id/bookings/remove', function() {
            it('should remove bookings', function(done) {
                var booking = new Booking();
                var spot = new Spot({
                    bookings: [booking.id]
                });
                insert(booking, spot, function() {
                    request(app).put('/api/spots/' + spot.id + '/bookings/remove')
                    .send({bookings: booking.id})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.spots.findById(spot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.bookings).to.be.empty;
                                done();
                            })
                        })
                })
            })
        })
        describe('GET /api/spots/:id/available', function() {
            it('should get availability', function(done) {
                var _av = {
                    start: new Date('2010/01/01'),
                    end: new Date('2030/01/01')
                }
                var spot = new Spot({
                    available: [_av]
                });
                insert(spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/available')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain.all(_av.start.toISOString(), 
                                                            _av.end.toISOString());
                            done();
                        })
                })
            })
        })
        describe('PUT /api/spots/:id/available', function() {
            it('should add availability', function(done) {
                var _av = {
                    start: new Date('2010/01/01'),
                    end: new Date('2030/01/01')
                }
                var spot = new Spot();
                insert(spot, function() {
                    request(app).put('/api/spots/' + spot.id + '/available')
                        .send(_av)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.spots.findById(spot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.available.checkRange(_av.start, _av.end)).to.be.true;
                                done();
                            })
                        })
                })
            })
        })
        describe('PUT /api/spots/:id/available/remove', function() {
            it('should remove availability', function(done) {
                var _av = {
                    start: new Date('2010/01/01'),
                    end: new Date('2030/01/01')
                }
                var spot = new Spot({
                    available: [_av]
                });
                insert(spot, function() {
                    request(app).put('/api/spots/' + spot.id + '/available/remove')
                    .send(_av)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.spots.findById(spot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.available.checkRange(_av.start, _av.end)).to.be.false;
                                done();
                            })
                        })
                })
            })
        })
        describe('GET /api/spots/:id/booked', function() {
            it('should get booked schedule', function(done) {
                var _bk = {
                    start: new Date('2070/01/01'),
                    end: new Date('2070/01/02')
                }
                var spot = new Spot({
                    booked: [_bk]
                });
                insert(spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/booked')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.text).to.contain.all(
                                _bk.start.toISOString(), 
                                _bk.end.toISOString());
                            done();    
                        })
                })
            });
        })
        describe('GET /api/spots/:id/schedule', function() {
            it('should get booked and available schedule', function(done) {
                var _av = {
                    start: new Date('2010/01/01'),
                    end: new Date('2030/01/01')
                }
                var _bk = {
                    start: new Date('2070/01/01'),
                    end: new Date('2070/01/02')
                }
                var spot = new Spot({
                    available: [_av],
                    booked: [_bk]
                });
                insert(spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/schedule')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data.booked).to.be.ok;
                            expect(res.body.data.available).to.be.ok;
                            expect(res.text).to.contain.all(
                                _av.start.toISOString(), 
                                _av.end.toISOString(),
                                _bk.start.toISOString(), 
                                _bk.end.toISOString());
                            done();    
                        })
                })
            });
        })

        describe('GET /api/spots/:id/price', function() {
            it('should get the spot price', function(done) {
                var pricePerHour = 123.45;
                var spot = new Spot();
                spot.price.perHour = pricePerHour;
                insert(spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/price')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            expect(res.body.data).to.deep.equal({
                                perHour: pricePerHour
                            });
                            done();
                        })
                })
            })
        })

        describe('PUT /api/spots/:id/price', function() {
            it('should get the spot price', function(done) {
                var pricePerHour = 123.45;
                var spot = new Spot();
                insert(spot, function() {
                    request(app).put('/api/spots/' + spot.id + '/price')
                        .send({
                            perHour: pricePerHour
                        })
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status).to.equal(200);
                            app.db.spots.findById(spot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc).to.be.ok;
                                expect(doc.getPrice()).to.deep.equal({
                                    perHour: pricePerHour
                                });
                                done();
                            })
                        })
                })
            })
        })
    })
})