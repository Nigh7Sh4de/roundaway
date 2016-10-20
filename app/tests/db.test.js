var expect = require('chai').expect;

var db = require('./../db');
var Errors = require('./../errors');

describe('db', function() {
    describe('connect', function() {
        it('should error when not supplied a connection string', function() {
            try {
                new db().connect()
                expect.fail()
            }
            catch(e) {
                expect(e).to.be.an.instanceOf(Errors.InvalidConfig);
            }
        })
    })
})