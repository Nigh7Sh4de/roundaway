var helper = require('./../helper');
var mockPromise = require('./mockPromise');
var expect= require('chai').expect;

describe('helper', function() {
    describe('checkOwner', function() {
        var _app,
            req,
            res;


        beforeEach(function() {
            _app = global.app;
            req = {
                url: '/api/collection/123456789012345678901234'
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
                findById: mockPromise(resolve, reject)
            }
        }

        it('errors with 500 if doc is not found', function(done) {
            prepareReqDoc(null);
            res.sendBad = function(err) {
                expect(err).to.be.ok;
                done();
            }
            new helper().checkOwner(req, res, expect.fail);
        })

        it('sets doc and continues for owner', function(done) {
            var userId = '123';
            prepareReqDoc({
                user: userId
            })
            req.user = {
                id: userId
            }
            new helper().checkOwner(req, res, done);
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
            new helper().checkOwner(req, res, done);
        })

        it('set doc and continues for themselves', function(done) {
            var userId = '123';
            prepareReqDoc({
                id: userId
            }, undefined, 'users')
            req.url = '/api/users/123456789012345678901234';
            req.user = {
                id: userId
            }
            new helper().checkOwner(req, res, done);
        })

        it('fails if unauthorized', function(done) {
            prepareReqDoc({});
            res.sendBad = function(err) {
                expect(err).to.be.ok;
                done();
            }
            new helper().checkOwner(req, res, expect.fail)
        })
    })
})