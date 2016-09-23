var helper = require('./../helper');
var mockPromise = require('./mockPromise');
var expect= require('chai').expect;

describe('helper', function() {
    describe('findResource', function() {
        var _app,
            req,
            res;


        beforeEach(function() {
            _app = global.app;
            req = {
                url: '/api/collection/123456789012345678901234',
                user: {}
            },
            res = {};
        })

        afterEach(function() {
            global.app = _app;
        })

        var prepareReqDoc = function(resolve, reject, col) {
            var collection = col || 'collection';
            global.app = {
                db: {}
            } 
            global.app.db[collection] = {
                find: mockPromise(resolve, reject)
            }
        }

        it('errors with 500 if doc is not found', function(done) {
            prepareReqDoc(null);
            res.sendBad = function(err) {
                expect(err).to.be.ok;
                done();
            }
            new helper().findResource(req, res, expect.fail);
        })

        it('should send back a collection if route is generic', function(done) {
            var userId = '123';
            prepareReqDoc([{
                user: userId
            }], null, 'users')
            req.user = {
                id: userId,
                admin: false
            }
            req.url = '/api/users';
            new helper().findResource(req, res, done, {
                owner: true
            });
        })

        it('sets doc and continues for owner', function(done) {
            var userId = '123';
            prepareReqDoc({
                user: userId
            })
            req.user = {
                id: userId,
                admin: false
            }
            new helper().findResource(req, res, done, {
                owner: true
            });
        })

        it('sets doc and continues for owner', function(done) {
            var userId = '123';
            prepareReqDoc({
                user: userId
            })
            req.user = {
                id: userId + '456',
                admin: true
            }
            new helper().findResource(req, res, done);
        })

        it('fails if unauthorized', function(done) {
            prepareReqDoc({});
            res.sendBad = function(err) {
                expect(err).to.be.ok;
                done();
            }
            new helper().findResource(req, res, expect.fail)
        })
    })
})