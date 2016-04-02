var async = require('async');
var expect = require('chai').expect;
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var request = require('supertest');
var sinon = require('sinon');
var server = require('./../../server');
// var inject = server.GetDefaultInjection();

describe('authController', function() {

    describe('route', function() {
        routeTest('authController', [
            {
                verb: verbs.GET,
                route: '/logout',
                method: 'Logout',
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/login/google',
                method: 'Login',
                methodParams: ['google'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/login/google/return',
                method: 'LoginReturn',
                methodParams: ['google'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/login/facebook',
                method: 'Login',
                methodParams: ['facebook'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/login/facebook/return',
                method: 'LoginReturn',
                methodParams: ['facebook'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/connect/google',
                method: 'Connect',
                methodParams: ['google'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/connect/google/return',
                method: 'ConnectReturn',
                methodParams: ['google'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/connect/facebook',
                method: 'Connect',
                methodParams: ['facebook'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            },
            {
                verb: verbs.GET,
                route: '/connect/facebook/return',
                method: 'ConnectReturn',
                methodParams: ['facebook'],
                ignoreAdmin: true,
                ignoreAuth: true,
                ignoreId: true,
                ignoreHappyPath: true,
                ignoreSadPath: true
            }
        ])
    });
    
    describe('method', function() {
        
        beforeEach(function () {
            var inject = server.GetDefaultInjection();
            app = server(inject);
            // inject = new server.GetDefaultInjection();
            // inject.authController = Object.assign({}, inject.authController);
        });
        
        describe('Logout', function() {
            it('should call passport logout', function() {
                var req = {
                    logout: sinon.spy() //mock the passport logout method
                }
                var res = {
                    redirect: sinon.spy() //mock the express redirect method
                }
                
                app.authController.Logout(req, res);
                
                expect(req.logout.calledOnce).to.be.true;
                
            });
            
            it ('should redirect to root', function() {
                var req = {
                    logout: sinon.spy() //mock the passport logout method
                }
                var res = {
                    redirect: sinon.spy() //mock the express redirect method
                }
                
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
                    authenticate: sinon.spy()
                }
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
                var ctrl = app.authController;
                var strats = [ 'google', 'facebook' ];
                var passport = {
                    authenticate: sinon.spy()
                }
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
                var ctrl = app.authController;
                var strats = [ 'google', 'facebook' ];
                var passport = {
                    authorize: sinon.spy()
                }
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
                var ctrl = app.authController;
                var strats = [ 'google', 'facebook' ];
                var passport = {
                    authorize: sinon.spy()
                }
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
});