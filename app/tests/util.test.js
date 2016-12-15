var expect = require('chai').expect;
var sinon = require('sinon');
var server = require('./../server');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var mockPromise = require('./mockPromise');
var expressExtensions = require('./../express');

routeTest('utilController', [
        {
            verb: verbs.PUT,
            route: '/api/util/location/geocode',
            method: 'Geocode',
            ignoreId: true,
            ignoreAuth: true,
            ignoreAdmin: true,
            ignoreOwner: true
        }
]);

describe('utilController', function() {
    var app,
        req = {},
        res = {};

    beforeEach(function() {
        var inject = server.GetDefaultInjection();
        app = server(inject);
        req = expressExtensions.mockRequest();
        res = expressExtensions.mockResponse();
    })
    
    describe('Geocode', function() {
        it('should return succesful result of node geocoder', function(done) {
            var fullAddress = "some very specific well formatted address";
            req.body.address = 'some address';
            app.geocoder.geocode = sinon.spy(function(address) {
                expect(address).to.deep.equal(req.body.address);
                return mockPromise([{ formattedAddress: fullAddress }])();
            });
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith([fullAddress])).to.be.true;
                done();
            }
            app.utilController.Geocode(req, res);
        })
    })
});