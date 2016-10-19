var expect = require('chai').expect;
var Errors = require('./../errors');

var server = require('./../server');
var config = {
    FACEBOOK_CLIENT_ID: "FACEBOOK_CLIENT_ID",
    FACEBOOK_CLIENT_SECRET: "FACEBOOK_CLIENT_SECRET",
    GOOGLE_CLIENT_ID: "GOOGLE_CLIENT_ID",
    GOOGLE_CLIENT_SECRET: "GOOGLE_CLIENT_SECRET",
    GOOGLE_API_KEY: "GOOGLE_API_KEY",
    STRIPE_SECRET_KEY: "STRIPE_SECRET_KEY",
    STRIPE_PUBLISH_KEY: "STRIPE_PUBLISH_KEY",
    JWT_SECRET_KEY: "JWT_SECRET_KEY",
    PORT: "PORT",
    DB_CONNECTION_STRING: "DB_CONNECTION_STRING"
}

describe.only('config', function() {
    describe('keys', function() {
        it('should continue if config has all necessary keys', function(done) {
            try {
                var app = server({config})
                done()
            }
            catch(e) {
                expect(e).to.not.be.an.instanceOf(Errors.InvalidConfig);
                done();
            }

        })
        describe('should fail if missing', function() {
            for (var key in config) {
                var _config = Object.assign({}, config);
                delete _config[key];
                it(key, function(done) {
                    try {
                        expect(server({config: _config})).to.throw(Error);
                        done('server should not have been created');
                    }
                    catch(e) {
                        expect(e).to.be.an.instanceOf(Errors.InvalidConfig, 'server should have broken since this key was missing');
                        done();
                    }
                })
            }
        })
    })
})