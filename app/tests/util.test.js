var expect = require('chai').expect;
var sinon = require('sinon');
var server = require('./../../server');
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var mockPromise = require('./mockPromise');
var expressExtensions = require('./../express');

routeTest('utilController', [
        {
            verb: verbs.POST,
            route: '/api/util/location/geocode',
            method: 'Geocode',
            ignoreId: true,
            ignoreAuth: true,
            ignoreAdmin: true,
            ignoreOwner: true
        },
        {
            verb: verbs.POST,
            route: '/api/util/location/geocode/reverse',
            method: 'ReverseGeocode',
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
            var coords = {
                longitude: 12,
                latitude: 21
            }
            req.body.address = 'some address';
            app.geocoder.geocode = sinon.spy(function(address) {
                expect(address).to.deep.equal(req.body.address);
                return mockPromise([coords])();
            });
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(coords)).to.be.true;
                done();
            }
            app.utilController.Geocode(req, res);
        })
    })
    
    describe('ReverseGeocode', function() {
        it('should return succesful result of reverse node geocoder', function(done) {
            var coords = {
                longitude: 12,
                latitude: 21
            }
            var address = "some address";
            req.body = coords;
            app.geocoder.reverse = sinon.spy(function(loc) {
                expect(loc).to.deep.equal({
                    lon: coords.longitude,
                    lat: coords.latitude
                });
                return mockPromise([{formattedAddress: address}])();
            });
            res.sent = function() {
                expect(res.sendGood.calledOnce).to.be.true;
                expect(res.sentWith(address)).to.be.true;
                done();
            }
            app.utilController.ReverseGeocode(req, res);
        })
    })
});