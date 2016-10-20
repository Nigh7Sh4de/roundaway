var expect = require('chai').expect;
var sinon = require('sinon');

var express = require('./../express');

describe('express', function() {
    describe('deepEqual', function() {
        it('should pass for two similar objects', function() {
            var a = {
                x: 123
            }
            var b = {
                x: 123
            }
            expect(express.deepEqual(a, b)).to.be.true;
        })

        it('should fail for two different objects', function() {
            var a = {
                x: 123
            }
            var b = {
                x: 456
            }
            expect(express.deepEqual(a, b)).to.be.false;
        })

        it('should fail for different size arrays', function() {
            var a = [1,2,3];
            var b = [1,2];
            expect(express.deepEqual(a, b)).to.be.false;
        })

        it('should fail if any element in array differs', function() {
            var a = [1,2,3];
            var b = [1,2,4];
            expect(express.deepEqual(a, b)).to.be.false;
        })

        it('should pass identical arrays', function() {
            var a = [{x:123}, 456];
            var b = [{x:123}, 456];
            expect(express.deepEqual(a, b)).to.be.true;
        })
    })

    describe('sendBad', function() {
        it('should stringify error JSON', function() {
            var error = {prop: 'value'};
            var error_string = JSON.stringify(error);
            var x = {
                status: function(){return this},
                send: sinon.spy(function(obj) {
                    expect(obj.errors).to.deep.include(error_string)
                })
            }
            express.sendBad.call(x, error);
            expect(x.send.calledOnce).to.be.true;
        })
    })

    describe('mockResponse', function() {
        var mockResponse;
        beforeEach(function() {
            mockResponse = express.mockResponse();
            sinon.stub(console, 'log');
        })

        afterEach(function() {
            if (console.log.restore)
                console.log.restore();
        })

        describe('print', function() {
            it('log outs first call first args', function() {
                mockResponse.send = sinon.spy();
                mockResponse.send('asdf');
                mockResponse.print();
                expect(console.log.calledOnce).to.be.true;
            })
        })

        describe('sentWith', function() {
            it('should fail if response body dne', function() {
                mockResponse.send = sinon.spy();
                mockResponse.send();
                expect(mockResponse.sentWith({}, true)).to.be.false;
            })


            it('should fail props on body if specified', function() {
                var obj = {
                    x: 123
                }
                mockResponse.send = sinon.spy();
                mockResponse.send({});
                expect(mockResponse.sentWith(obj, true)).to.be.false;
            })

            it('should pass props on body if specified', function() {
                var obj = {
                    x: 123
                }
                mockResponse.send = sinon.spy();
                mockResponse.send(obj);
                expect(mockResponse.sentWith(obj, true)).to.be.true;
            })
        })

        describe('sentError', function() {
            it('should fail if sendBad was never called', function() {
                expect(mockResponse.sentError(Error)).to.be.false;
            })

            it('should pass if no error type is specified', function() {
                mockResponse.sendBad = sinon.spy();
                mockResponse.sendBad();
                expect(mockResponse.sentError()).to.be.true;
            })

            it('should work with error instances', function() {
                var error = new Error('some error');
                mockResponse.send = sinon.spy();
                mockResponse.sendBad = sinon.spy(function(error) {
                    this.send({errors: [error.toString()]})
                })
                mockResponse.sendBad(error);
                expect(mockResponse.sentError(error)).to.be.true;
            })

            it('should work with strings', function() {
                var error = 'some error';
                mockResponse.send = sinon.spy();
                mockResponse.sendBad = sinon.spy(function(error) {
                    this.send({errors: [error]})
                })
                mockResponse.sendBad(error);
                expect(mockResponse.sentError(error)).to.be.true;
            })
        })
    })
})