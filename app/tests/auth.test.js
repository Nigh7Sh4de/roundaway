var expect = require('chai').expect;
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var request = require('supertest');
var sinon = require('sinon');
var server = require('./../../server');

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
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    });

    describe('Authenticate', function() {
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
                ctrl.Authenticate(req, res);
                expect(passport.authenticate.calledWith(s + '-token')).to.be.true;
            })
            expect(passport.authenticate.callCount).to.equal(strats.length);
        })
    })
});