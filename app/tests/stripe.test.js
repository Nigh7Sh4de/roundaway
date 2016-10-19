var expect = require('chai').expect;
var Errors = require('./../errors');
var Stripe = require('./../stripe');

describe('Stripe', function() {
    describe('constructor', function() {
        it('should error if no stripe key is provided', function(done) {
            try {
                var stripe = new Stripe();
                done('Stripe should have failed since no key was provided');
            }
            catch(e) {
                expect(e).to.be.an.instanceOf(Errors.InvalidConfig);
                done();
            }
        })
    })
    describe('charge', function() {
        it('should post to stripe to create a charge', function() {
            var stripe = new Stripe('some key');
            var token = 'some token';
            var amount = 123.45;
            var amountInCents = parseInt(amount * 100);
            stripe.stripe = {
                charges: {
                    create: function(opt) {
                        return Promise.resolve(opt);
                    }
                }
            }
            return stripe.charge(token, amount).then(function(opt) {
                expect(opt.card).to.equal(token);
                expect(opt.amount).to.equal(amountInCents);
                expect(opt.currency).to.equal('cad');
            })
        })
    })
})