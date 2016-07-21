var expect = require('chai').expect;
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var request = require('supertest');
var sinon = require('sinon');
var server = require('./../../server');

routeTest('authController', [
    {
        verb: verbs.GET,
        route: '/logout',
        method: 'Logout',
        ignoreAdmin: true,
        ignoreAuth: true,
        ignoreId: true,
        ignoreOwner: true
    },
    // {
    //     verb: verbs.GET,
    //     route: '/login/google',
    //     method: 'Login',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // },
    // {
    //     verb: verbs.GET,
    //     route: '/login/google/return',
    //     method: 'LoginReturn',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // },
    {
        verb: verbs.POST,
        route: '/auth/google',
        method: 'LoggedIn',
        ignoreAdmin: true,
        ignoreAuth: true,
        ignoreId: true,
        ignoreOwner: true
    },
    // {
    //     verb: verbs.GET,
    //     route: '/login/facebook',
    //     method: 'Login',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // },
    // {
    //     verb: verbs.GET,
    //     route: '/login/facebook/return',
    //     method: 'LoginReturn',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // },
    {
        verb: verbs.POST,
        route: '/auth/facebook',
        method: 'LoggedIn',
        ignoreAdmin: true,
        ignoreAuth: true,
        ignoreId: true,
        ignoreOwner: true
    }
    //,
    // {
    //     verb: verbs.GET,
    //     route: '/connect/google',
    //     method: 'Connect',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // },
    // {
    //     verb: verbs.GET,
    //     route: '/connect/google/return',
    //     method: 'ConnectReturn',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // },
    // {
    //     verb: verbs.GET,
    //     route: '/connect/facebook',
    //     method: 'Connect',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // },
    // {
    //     verb: verbs.GET,
    //     route: '/connect/facebook/return',
    //     method: 'ConnectReturn',
    //     ignoreAdmin: true,
    //     ignoreAuth: true,
    //     ignoreId: true,
    // }
])

describe('authController', function() {
    var app,
        req,
        res;
    
    beforeEach(function () {
        var inject = server.GetDefaultInjection();
        app = server(inject);
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    });
    
    describe('Logout', function() {
        it('should call passport logout', function() {
            app.authController.Logout(req, res);
            
            expect(req.logout.calledOnce).to.be.true;
            
        });
        
        it ('should redirect to root', function() {
            app.authController.Logout(req, res);
            
            expect(res.redirect.calledOnce).to.be.true;
            expect(res.redirect.calledWith('/')).to.be.true;
        });
    });
    
    describe('Login', function() {
        it ('should athenticate with given strat', function() {
            var ctrl = app.authController;
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authenticate: sinon.spy(function() { return function(){} })
            }
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                req.params.strat = s;
                ctrl.Login(req, res);
                expect(passport.authenticate.calledWith(s)).to.be.true;
            })
            expect(passport.authenticate.callCount).to.equal(strats.length);
        });
    });
    
    describe('LoginReturn', function() {
        it ('should athenticate with given strat', function() {
            var ctrl = app.authController;
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authenticate: sinon.spy(function() { return function(){} })
            }
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                req.params.strat = s;
                ctrl.LoginReturn(req, res);
                expect(passport.authenticate.calledWith(s)).to.be.true;
            })
            expect(passport.authenticate.callCount).to.equal(strats.length);
        });
    });

    describe('LoggedIn', function() {
        it('should authenticate with the given strat token', function() {
            var ctrl = app.authController;
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authenticate: sinon.spy(function() { return function(){} })
            }
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                req.params.strat = s;
                ctrl.LoggedIn(req, res);
                expect(passport.authenticate.calledWith(s + '-token')).to.be.true;
            })
            expect(passport.authenticate.callCount).to.equal(strats.length);
        })
    })
    
    describe('Connect', function() {
        it ('should authorize with given strat', function() {
            var ctrl = app.authController;
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authorize: sinon.spy(function() { return function(){} })
            }
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                req.params.strat = s;
                ctrl.Connect(req, res);
                expect(passport.authorize.calledWith(s)).to.be.true;
            })
            expect(passport.authorize.callCount).to.equal(strats.length);
        });
    });
    
    describe('ConnectReturn', function() {
        it ('should authorize with given strat', function() {
            var ctrl = app.authController;
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authorize: sinon.spy(function() { return function(){} })
            }
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                req.params.strat = s;
                ctrl.ConnectReturn(req, res);
                expect(passport.authorize.calledWith(s)).to.be.true;
            })
            expect(passport.authorize.callCount).to.equal(strats.length);
        });
    });
});