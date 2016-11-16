var expect = require('chai').expect;
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
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    });

    describe('Authenticate', function() {
        it('should authenticate with the given strat token', function(done) {
            var ctrl = app.authController;
            var strats = [ 'facebook', 'google' ];
            req.body.access_token = 'someinvalidtoken';
            req.body.refresh_token = 'someinvalidtoken';
            res.sendBad = sinon.spy((err) => {
                expect(err).to.be.ok;
                expect(err).to.have.property('name', 'InternalOAuthError')
                res.send(err);
            })
            res.sent = () => {
                if (res.send.callCount >= strats.length) {
                    expect(res.sendBad.callCount === res.send.callCount)
                    done();
                }
            }
            strats.forEach(function (s) {
                req.params.strat = s;
                ctrl.Authenticate(req, res);
            })
        })
    })
});