var expect = require('chai').expect;
var Errors = require('./../errors');
var User = require('./../models/User');
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var request = require('supertest');
var sinon = require('sinon');
var server = require('./../server');

routeTest('authController', [
    {
        verb: verbs.POST,
        route: '/auth/google',
        method: 'Authenticate',
        ignoreAdmin: true,
        ignoreAuth: true,
        ignoreId: true,
        ignoreOwner: true
    },
    {
        verb: verbs.POST,
        route: '/auth/facebook',
        method: 'Authenticate',
        ignoreAdmin: true,
        ignoreAuth: true,
        ignoreId: true,
        ignoreOwner: true
    }
])

describe('authController', function() {
    var app,
        req,
        res;
    
    beforeEach(function () {
        var inject = server.GetDefaultInjection();
        app = server(inject);

        delete app.passport
        app.passport = require('passport')
        const auth = inject.auth(inject.db, inject.config)
        for (var strat in auth) {
            auth[strat]._oauth2 = {
                get: (profileURL, accessToken, cb) => cb(null, '{}')
            }
            app.passport.use(auth[strat])
        }

        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();

        sinon.stub(User.prototype, 'save', (cb) => cb(null, this))

    });

    afterEach(function() {
        if (User.prototype.save.restore)
            User.prototype.save.restore();
    })

    describe('Authenticate', function() {
        it('should authenticate with the given strat token', function(done) {
            var strats = [ 'facebook', 'google' ];
            app.db.users = {
                findOne: (search, cb) => cb(null, {})
            }
            req.body.access_token = 'sometoken';
            req.body.refresh_token = 'sometoken';
            res.sent = () => {
                if (res.send.callCount >= strats.length) {
                    expect(res.sendGood.callCount === res.send.callCount)
                    done();
                }
            }
            res.sendBad = done;
            strats.forEach(function (s) {
                req.params.strat = s;
                app.authController.Authenticate(req, res, done);
            })
        })

        it('should fail if db threw an error', function(done) {
            app.db.users = {
                findOne: (search, cb) => cb(new Errors.TestError())
            }
            req.params.strat = 'facebook';
            req.body.access_token = 'sometoken';
            req.body.refresh_token = 'sometoken';
            res.sent = () => {
                expect(res.sendBad.calledOnce).to.be.true;
                expect(res.sentError(Errors.TestError)).to.be.true;
                done();
            }
            res.sendGood = done;
            app.authController.Authenticate(req, res, done);
        })

        it('should create new user if not found', function(done) {
            app.db.users = {
                findOne: (search, cb) => cb()
            }
            req.params.strat = 'facebook';
            req.body.access_token = 'sometoken';
            req.body.refresh_token = 'sometoken';
            res.sendBad = done;
            res.sent = () => {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.authController.Authenticate(req, res, done);
        })
    })
});