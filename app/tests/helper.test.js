var helper = require('./../helper');
var mockPromise = require('./mockPromise');
var expect = require('chai').expect;
var sinon = require('sinon');
var Errors = require('./../errors');

describe('helper', function() {
    describe('init', function() {
        it('applies functions', function() {
            var x = {};
            var h = new helper();
            h.__test_function = function(){}
            h.init(x);
            expect(x.__test_function).to.be.ok;
        })

        it('applies middleware', function() {
            var h = new helper();
            var m = function(){};
            var x = {
                use: sinon.spy(function(middleware) {
                    expect(middleware).to.equal(m);
                })
            };
            h.middleware = [m];
            h.init(x);
            expect(x.use.calledOnce).to.be.true;
        })
    })

    describe('start', function() {
        it('listens to the config port', function() {
            var h = new helper();
            var p = 123;
            var x = {
                listen: sinon.spy(function(port) {
                    expect(port).to.equal(p)
                }),
                config: {
                    PORT: p
                }
            }
            h.init(x);
            x.start();
            expect(x.listen.calledOnce).to.be.true;
        })
    })

    describe('started', function() {
        var _port = 123;

        before(function() {
            sinon.stub(console, 'log', function(str) {
                expect(str).to.contain(_port);
            })
        })

        after(function() {
            if (console.log.restore)
                console.log.restore();
        })

        it('should display the apps port', function() {
            var x = {
                address: function() {
                    return {
                        port: _port
                    }
                }
            }
            new helper().init(x);
            x.started();
            expect(console.log.calledOnce).to.be.true;
            expect(console.log.firstCall.args[0]).to.contain(_port);
            console.log.restore();
        })
    })

    describe('sendIndex', function() {
        it('send index.html', function() {
            var res = {
                sendFile: sinon.spy(function(dir) {
                    expect(dir).to.contain('index.htm');
                })
            }
            new helper().sendIndex({}, res);
            expect(res.sendFile.calledOnce).to.be.true;
        })
    })

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

        it('errors if user is not authenticated', function(done) {
            res.sendBad = sinon.spy(function(errors) {
                expect(errors).to.be.an.instanceOf(Errors.Unauthorized);
                done();
            })
            req.user = null;
            new helper().findResource(req, res, expect.fail);
        })

        it('errors with 500 if doc is not found', function(done) {
            prepareReqDoc(null);
            req.user.admin = true;
            res.sendBad = function(err) {
                expect(err).to.be.ok;
                expect(err).to.be.an.instanceOf(Errors.NotFound);
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

        it('returns current user if not admin', function(done) {
            var userId = '123abc'
            var user = {
                id: userId
            }
            prepareReqDoc([user], null, 'users')
            req.user = {
                id: userId
            }
            res.sendBad = done
            req.url = '/api/users'
            new helper().findResource(req, res, function() {
                expect(req.docs).to.deep.include(user)
                done()
            }, {
                owner: true
            })
        })
    })
})