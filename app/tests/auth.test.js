var expect = require('chai').expect;
var routeTest = require('./routeTestBase');
var verbs = routeTest.verbs;
var request = require('supertest');
var sinon = require('sinon');
var server = require('./../../server');
// var inject = server.GetDefaultInjection();

describe('authController', function() {
    
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