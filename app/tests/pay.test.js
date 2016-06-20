var expect = require('chai').expect;
var expressExtensions = require('./../express');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var server = require('./../../server');

routeTest('payController', [
    {
        verb: verbs.GET,
        route: '/api/pay',
        method: 'SayHi',
        ignoreId: true
    }
])

describe('payController', function() {
    var app;
    
    var req = {},
        res = {};
    
    beforeEach(function() {
        app = server(server.GetDefaultInjection());
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })

    describe('SayHi', function() {
        it('should say hi', function(done) {
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                done();
            }
            app.payController.SayHi(req, res);
        })
    })
})