var jwt = require('jsonwebtoken');
var request = require('supertest');
var sinon = require('sinon');
var expect = require('chai').expect;
var server = require('./../server');
var inject = server.GetDefaultInjection(true);
var testConnectionString = "mongodb://localhost/roundaway_test"
var expressExtensions = require('./../express');

var User = require('./../models/User');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');
var Booking = require('./../models/Booking');
var Car = require('./../models/Car');

var _d = describe;
if (!inject.config.RUN_SYSTEM_TESTS)
    _d = _d.skip;

it.external = it;
if (!inject.config.RUN_EXTERNAL_TESTS)
    it.external = it.external.skip;

_d('the entire app should not explode', function() {
    var app;

    var userProfile = {
        name: 'Nigh7'
    }
    var userAuth = {
        facebook: 'facebook_auth'
    }
    var sessionUser;
    var adminUser;
    var token = 'aaa.bbb.ccc';
    var admin_token = 'aaa.bbb.ccc';

    before(function(done) {
        sessionUser = new User({
            admin: false,
            profile: userProfile,
            authid: userAuth
        });
        adminUser = new User({
            admin: true,
            profile: userProfile,
            authid: userAuth
        });
        inject.config.DB_CONNECTION_STRING = testConnectionString;
        token = jwt.sign({id:sessionUser.id}, inject.config.JWT_SECRET_KEY);
        admin_token = jwt.sign({id:adminUser.id}, inject.config.JWT_SECRET_KEY);
        app = server(inject);
        app.stripe.charge = function(t, a) {
            return Promise.resolve({
                token: t,
                amount: a
            })
        }
        app.db.connection.on('error', function(err) {
            throw err;
        });
        app.db.connection.once('open', function(err) {
            expect(err).to.not.be.ok;
            app.db.users.collection.insert(
                [
                    sessionUser.toJSON({getters: true}), 
                    adminUser.toJSON({getters: true})
                ], done);
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
                if (collection_name.indexOf("system.") < 0 &&
                    collection_name.indexOf("users") < 0)
                    app.db.connection.db.collection(collection_name).drop(next);
                else next();
            })
        });
    })

    after(function(done) {
        app.db.connection.db.dropDatabase(done);
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
            if (!item.user)
                item.user = sessionUser.id;
            item.save(next);
        })
    }

    describe('Util Controller', function() {
        describe('POST /api/util/location/geocode', function() {
            it.external('should return formattedAddress for address', function(done) {
                var address = "49 Wellington St W, Toronto, ON";
                var fullAddress = '49 Wellington St W, Toronto, ON M5J 2T6, Canada';
                request(app).post('/api/util/location/geocode')
                    .send({address: address})
                    .end(function(err, res) {
                        expect(res.text).to.contain(fullAddress);
                        expect(res.status, res.body.errors).to.equal(200);
                        done();
                    })
            })
        })
    })

    describe('User Controller', function() {
        describe('GET /api/users', function() {
        it('should return users in db', function(done) {
                var user = new User();
                insert(user, function() {
                    request(app).get('/api/users')
                        .set('Authorization', 'JWT ' + admin_token)
                        .end(function(err, res) {
                        expect(res.text).to.contain(user.id);
                        expect(res.status, res.body.errors).to.equal(200);
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
                        expect(res.status, res.body.errors).to.equal(200);
                        expect(res.text).to.contain.all(userAuth.facebook, userProfile.name);
                        done();
                    })

            })
        })
        describe('GET /api/users/:id/lots', function() {
            it('should return lots for the user', function(done) {
                var lot = new Lot({
                    user: sessionUser.id
                });
                insert(lot, function() {
                    request(app).get('/api/users/' + sessionUser.id + '/lots')
                        .set('Authorization', 'JWT ' + admin_token)
                        .end(function(err, res) {
                            expect(res.text).to.contain(lot.id);
                            expect(res.status, res.body.errors).to.equal(200);
                            done();
                        })
                });
            })
        })
        describe('GET /api/users/:id/spots', function() {
            it('should return spots for the user', function(done) {
                var spot = new Spot({
                    user: sessionUser.id
                });
                insert(spot, function() {
                    request(app).get('/api/users/' + sessionUser.id + '/spots')
                        .set('Authorization', 'JWT ' + admin_token)
                        .end(function(err, res) {
                            expect(res.text).to.contain(spot.id);
                            expect(res.status, res.body.errors).to.equal(200);
                            done();
                        })
                });
            })
        })
        describe('GET /api/users/:id/bookings', function() {
            it('should return bookings for the user', function(done) {
                var booking = new Booking({
                    user: sessionUser.id
                });
                insert(booking, function() {
                    request(app).get('/api/users/' + sessionUser.id + '/bookings')
                        .set('Authorization', 'JWT ' + admin_token)
                        .end(function(err, res) {
                            expect(res.text).to.contain(booking.id);
                            expect(res.status, res.body.errors).to.equal(200);
                            done();
                        })
                });
            })
        })
        describe('GET /api/users/:id/profile', function() {
            it('should return profile for the user', function(done) {
                request(app).get('/api/users/' + sessionUser.id + '/profile')
                    .set('Authorization', 'JWT ' + admin_token)
                    .end(function(err, res) {
                        expect(res.body.data).to.deep.equal(userProfile);
                        expect(res.status, res.body.errors).to.equal(200);
                        done();
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
                        .set('Authorization', 'JWT ' + admin_token)
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

    describe('Car controller', function() {
        describe('GET /api/cars', function() {
            describe('?license', function() {
                it('should find cars with license', function(done) {
                    var license = '1z2x3c';
                    var car = new Car({
                        license: license
                    }),
                        car2 = new Car();
                    insert(car, function() {
                        request(app).get('/api/cars?license=' + license)
                            .set('Authorization', 'JWT ' + token)
                            .end(function(err, res) {
                                expect(res.status, res.body.errors).to.equal(200);
                                expect(res.text).to.contain(car.id);
                                expect(res.text).to.not.contain(car2.id);
                                done();
                            })
                    })
                })
            })
        })

        describe('GET /api/cars/:id/bookings', function() {
            it('should return all bookings for car', function(done) {
                var car = new Car();
                var booking = new Booking({
                        car: car.id,
                        start: new Date(),
                        end: new Date()
                    }),
                    booking2 = new Booking({
                        car: car.id,
                        start: new Date('2000/01/01'),
                        end: new Date('2000/01/02')
                    })
                insert(car, booking, booking2, function() {
                    request(app).get('/api/cars/' + car.id + '/bookings')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain.all(booking.id, booking2.id);
                            done();
                        })
                })
            })
        })

        describe('GET /api/cars/:id/bookings/next', function() {
            it('should return next booking for car', function(done) {
                var car = new Car();
                var booking = new Booking({
                        car: car.id,
                        start: new Date(),
                        end: new Date(Date.now().valueOf() + 1000*60*60*24)
                    }),
                    booking2 = new Booking({
                        car: car.id,
                        start: new Date('2000/01/01'),
                        end: new Date('2000/01/02')
                    })
                insert(car, booking, booking2, function() {
                    request(app).get('/api/cars/' + car.id + '/bookings/next')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(booking.id);
                            expect(res.text).to.not.contain(booking2.id);
                            done();
                        })
                })
            })
        })
    })

    describe('Booking controller', function() {
        describe('GET /api/bookings', function() {
            it('should return all bookings', function(done) {
                var booking = new Booking(),
                    booking2 = new Booking({
                        user: '123456789012345678901234'
                    });
                insert(booking, booking2, function() {
                    request(app).get('/api/bookings')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(booking.id);
                            expect(res.text).to.not.contain(booking2.id);
                            done();
                        })
                })
            })
        })
        describe('GET /api/bookings/:id', function() {
            it('should return specific booking', function(done) {
                var booking = new Booking({
                    user: sessionUser.id 
                });
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(booking.id);
                            done();
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(spot.id);
                            done();
                        });
                })
            })
        })
        describe('GET /api/bookings/:id/car', function() {
            it('should return car for the booking', function(done) {
                var car = new Car();
                var booking = new Booking({
                    car: car.id
                });
                insert(car, booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/car')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(car.id);
                            done();
                        });
                })
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.deep.equal(booking.start.toISOString());
                            done();
                        })
                });
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.deep.equal(booking.end.toISOString());
                            done();
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.deep.equal(booking.getDuration());
                            done();
                        })
                })
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.be.ok;
                            expect(res.body.data.start).to.deep.equal(booking.start.toISOString());
                            expect(res.body.data.end).to.deep.equal(booking.end.toISOString());
                            done();
                        })
                });
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.equal(price);
                            done();
                        })
                });
            })
        })
        describe('PUT /api/bookings/:id/pay', function() {
            it('should pay the price of the booking', function(done) {
                var price = 123.45;
                var booking = new Booking({
                    start: new Date('2000/01/01'),
                    end: new Date('2050/01/01'),
                    price: price
                })
                insert(booking, function() {
                    request(app).put('/api/bookings/' + booking.id + '/pay')
                        .send({token: 'some token'})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.deep.contain(price);
                            done();
                        })
                });
            })
        })
        describe('GET /api/bookings/:id/status', function() {
            it('should get the status of the booking', function(done) {
                var booking = new Booking({
                    start: new Date('2000/01/01'),
                    end: new Date('2050/01/01')
                })
                insert(booking, function() {
                    request(app).get('/api/bookings/' + booking.id + '/status')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.equal('unpaid');
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
                    lot2 = new Lot({
                        user: '123456789012345678901234'
                    });
                insert(lot, lot2, function() {
                    request(app).get('/api/lots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(lot.id);
                            expect(res.text).to.not.contain(lot2.id);
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(lot.id);
                            done();
                        })
                })
            })
        })
        describe('PUT /api/lots', function() {
            it.external('should create a new lot', function(done) {
                request(app).put('/api/lots')
                    .set('Authorization', 'JWT ' + admin_token)
                    .send({lot: {
                        location: {
                            address: "1 Yonge St, Toronto ON"
                        }
                    }})
                    .end(function(err, res) {
                        expect(err).to.not.be.ok;
                        expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(lot.location.coordinates.toString());
                            done();
                        });
                })
            })
        })
        describe('GET /api/lots/:id/spots', function() {
            it('should return spot for the lot', function(done) {
                var lot = new Lot()
                var spot = new Spot({
                    lot: lot
                });
                insert(spot, lot, function() {
                    request(app).get('/api/lots/' + lot.id + '/spots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain.all(spot.id, spot.id);
                            done();
                        });
                })
            })
        })
        describe('GET /api/lots/:id/available', function() {
            it('should get availability', function(done) {
                var _av = {
                    start: new Date('2010/01/01'),
                    end: new Date('2030/01/01')
                }
                var lot = new Lot({
                    available: [_av]
                });
                insert(lot, function() {
                    request(app).get('/api/lots/' + lot.id + '/available')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain.all(_av.start.toISOString(), 
                                                            _av.end.toISOString());
                            done();
                        })
                })
            })
        })
        describe('PUT /api/lots/:id/available', function() {
            it('should add availability', function(done) {
                var _av = {
                    start: new Date('2010/01/01'),
                    end: new Date('2030/01/01')
                }
                var lot = new Lot();
                var spot = new Spot({
                    lot: lot.id
                });
                insert(lot, spot, function() {
                    request(app).put('/api/lots/' + lot.id + '/available')
                        .send(_av)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            app.db.lots.findById(lot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.available.checkRange(_av.start, _av.end)).to.be.true;
                                app.db.spots.findById(spot.id, function(err, spot) {
                                    expect(spot.available.checkRange(_av.start, _av.end)).to.be.true;
                                    done();
                                })
                            })
                        })
                })
            })
        })
        describe('PUT /api/lots/:id/available/remove', function() {
            it('should remove availability', function(done) {
                var _av = {
                    start: new Date('2010/01/01'),
                    end: new Date('2030/01/01')
                }
                var lot = new Lot({
                    available: [_av]
                });
                var spot = new Spot({
                    lot: lot.id,
                    available: [_av]
                })
                insert(lot, spot, function() {
                    request(app).put('/api/lots/' + lot.id + '/available/remove')
                    .send(_av)
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            app.db.lots.findById(lot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc.available.checkRange(_av.start, _av.end)).to.be.false;
                                app.db.spots.findById(spot.id, function(err, spot) {
                                    expect(spot.available.checkRange(_av.start, _av.end)).to.be.false;
                                    done();
                                })
                            })
                        })
                })
            })
        })

        describe('GET /api/lots/:id/name', function() {
            it('should get the lot name', function(done) {
                var name = 'some name';
                var lot = new Lot({
                    name: name
                });
                insert(lot, function() {
                    request(app).get('/api/lots/' + lot.id + '/name')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.deep.equal(name);
                            done();
                        })
                })
            })
        })

        describe('PUT /api/lots/:id/name', function() {
            it('should get the lot name', function(done) {
                var lot = new Lot();
                var name = 'some name';
                insert(lot, function() {
                    request(app).put('/api/lots/' + lot.id + '/name')
                        .send({
                            name: name
                        })
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            app.db.lots.findById(lot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc).to.be.ok;
                                expect(doc.getName()).to.deep.equal(name);
                                done();
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
                    spot2 = new Spot({
                        user: '123456789012345678901234'
                    });
                insert(spot, spot2, function() {
                    request(app).get('/api/spots')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(spot.id);
                            expect(res.text).to.not.contain(spot2.id);
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(spot.id);
                            done();
                        })
                })
            })
        })
        describe('PUT /api/spots', function() {
            it.external('should create a new spot', function(done) {
                request(app).put('/api/spots')
                    .set('Authorization', 'JWT ' + admin_token)
                    .send({spot: {
                        location: {
                            address: "1 Yonge St, Toronto ON"
                        },
                        price: {
                            perHour: 123.45
                        }
                    }})
                    .end(function(err, res) {
                        expect(err).to.not.be.ok;
                        expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.text).to.contain(spot.location.coordinates.toString());
                            done();
                        });
                })
            })
        })
        describe('GET /api/spots/:id/bookings', function() {
            it('should get bookings', function(done) {
                var spot = new Spot();
                var booking = new Booking({
                    spot: spot._id
                });
                insert(booking, spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/bookings')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
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
                var license = 'some license'
                var booking = {
                    start: new Date('2040/01/01'),
                    end: new Date('2050/01/01'),
                    license: license 
                };
                insert(spot, function() {
                    request(app).put('/api/spots/' + spot.id + '/bookings')
                    .send({bookings: booking, createCarIfNotInSystem: true})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            app.db.bookings.find({spot: spot.id}, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc).to.be.ok;
                                done();
                            })
                        })
                })
            })
        })
        describe('PUT /api/spots/:id/bookings/remove', function() {
            it('should remove bookings', function(done) {
                var spot = new Spot();
                var booking = new Booking({
                    spot: spot,
                    start: new Date('2000/01/01'),
                    end: new Date('2000/01/02')
                });
                insert(booking, spot, function() {
                    request(app).put('/api/spots/' + spot.id + '/bookings/remove')
                    .send({id: booking.id})
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            Promise.all([
                                app.db.spots.findById(spot.id).exec(),
                                app.db.bookings.findById(booking.id).exec()
                            ]).then(function(results) {
                                expect(err).to.not.be.ok;
                                expect(results[0].available.checkRange(booking.start, booking.end)).to.be.ok;
                                expect(results[1]).to.not.be.ok;
                                done();
                            }).catch(function(err) {
                                done(err);
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
                            expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
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
                            expect(res.status, res.body.errors).to.equal(200);
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

        describe('GET /api/spots/:id/name', function() {
            it('should get the spot name', function(done) {
                var name = 'some name';
                var spot = new Spot({
                    name: name
                });
                insert(spot, function() {
                    request(app).get('/api/spots/' + spot.id + '/name')
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            expect(res.body.data).to.deep.equal(name);
                            done();
                        })
                })
            })
        })

        describe('PUT /api/spots/:id/name', function() {
            it('should get the spot name', function(done) {
                var spot = new Spot();
                var name = 'some name';
                insert(spot, function() {
                    request(app).put('/api/spots/' + spot.id + '/name')
                        .send({
                            name: name
                        })
                        .set('Authorization', 'JWT ' + token)
                        .end(function(err, res) {
                            expect(err).to.not.be.ok;
                            expect(res.status, res.body.errors).to.equal(200);
                            app.db.spots.findById(spot.id, function(err, doc) {
                                expect(err).to.not.be.ok;
                                expect(doc).to.be.ok;
                                expect(doc.getName()).to.deep.equal(name);
                                done();
                            })
                        })
                })
            })
        })
    })
})