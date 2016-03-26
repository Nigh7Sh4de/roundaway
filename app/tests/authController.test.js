var async = require('async');
var expect = require('chai').expect;
var request = require('supertest');
var sinon = require('sinon');
var server = require('./../../server');
var inject = server.GetDefaultInjection();

describe('authController', function() {
    
    beforeEach(function () {
        inject = new server.GetDefaultInjection();
        inject.authController = Object.assign({}, inject.authController);
    });
    
    describe('/logout', function() {
        it('should call correct method', function(done) {
            var logout = sinon.spy(inject.authController, 'Logout');
            
            request(server(inject)).get('/logout')
                .expect(302)
                .end(function (err) {
                    if (err != null)
                        return done(err);
                    expect(logout.calledOnce).to.be.true;
                    return done();
                });
        });
    });
    
    describe('/login', function() {
        it('should call correct method', function(done) {
            var login = sinon.spy(inject.authController, 'Login');
            var loginReturn = sinon.spy(inject.authController, 'LoginReturn');
            var app = server(inject);
            
            async.series([
                function(cb) { request(app).get('/login/google').expect(302, cb) },
                function(cb) { request(app).get('/login/facebook').expect(302, cb) },
                function(cb) { request(app).get('/login/google/return').expect(302, cb) },
                function(cb) { request(app).get('/login/facebook/return').expect(302, cb) },
            ], function(err) {
                if (err != null)
                    return done(err);
                expect(login.calledTwice).to.be.true;
                expect(loginReturn.calledTwice).to.be.true;
                return done();
            }); 
        });
    });
    
    describe('/connect', function() {
        it('should call correct method', function(done) {
            var connect = sinon.spy(inject.authController, 'Connect');
            var connectReturn = sinon.spy(inject.authController, 'ConnectReturn');
            var app = server(inject);
            
            async.series([
                function(cb) { request(app).get('/connect/google').expect(302, cb) },
                function(cb) { request(app).get('/connect/facebook').expect(302, cb) },
                function(cb) { request(app).get('/connect/google/return').expect(302, cb) },
                function(cb) { request(app).get('/connect/facebook/return').expect(302, cb) },
            ], function(err) {
                if (err != null)
                    return done(err);
                expect(connect.calledTwice).to.be.true;
                expect(connectReturn.calledTwice).to.be.true;
                return done();
            }); 
        });
    });
    
    describe('Logout', function() {
        it('should call passport logout', function() {
            var ctrl = inject.authController;
            var req = {
                logout: sinon.spy() //mock the passport logout method
            }
            var res = {
                redirect: sinon.spy() //mock the express redirect method
            }
            
            ctrl.Logout(req, res);
            
            expect(req.logout.calledOnce).to.be.true;
            
        });
        
        it ('should redirect to root', function() {
            var ctrl = inject.authController;
            var req = {
                logout: sinon.spy() //mock the passport logout method
            }
            var res = {
                redirect: sinon.spy() //mock the express redirect method
            }
            
            ctrl.Logout(req, res);
            
            expect(res.redirect.calledOnce).to.be.true;
            expect(res.redirect.calledWith('/')).to.be.true;
        });
    });
    
    describe('Login', function() {
        it ('should athenticate with given strat', function() {
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authenticate: sinon.spy()
            }
            var ctrl = inject.authController;
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                ctrl.Login(s);
                expect(passport.authenticate.calledWith(s)).to.be.true;
            })
            expect(passport.authenticate.callCount).to.equal(strats.length);
        });
    });
    
    describe('LoginReturn', function() {
        it ('should athenticate with given strat', function() {
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authenticate: sinon.spy()
            }
            var ctrl = inject.authController;
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                ctrl.LoginReturn(s);
                expect(passport.authenticate.calledWith(s)).to.be.true;
            })
            expect(passport.authenticate.callCount).to.equal(strats.length);
        });
    });
    
    describe('Connect', function() {
        it ('should authorize with given strat', function() {
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authorize: sinon.spy()
            }
            var ctrl = inject.authController;
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                ctrl.Connect(s);
                expect(passport.authorize.calledWith(s)).to.be.true;
            })
            expect(passport.authorize.callCount).to.equal(strats.length);
        });
    });
    
    describe('ConnectReturn', function() {
        it ('should authorize with given strat', function() {
            var strats = [ 'google', 'facebook' ];
            var passport = {
                authorize: sinon.spy()
            }
            var ctrl = inject.authController;
            ctrl.app = {
                passport: passport
            }
            strats.forEach(function (s) {
                ctrl.ConnectReturn(s);
                expect(passport.authorize.calledWith(s)).to.be.true;
            })
            expect(passport.authorize.callCount).to.equal(strats.length);
        });
    });
    
});