var expect = require('chai').expect;
var Stripe = require('./../stripe');

describe('Stripe', function() {
    describe('charge', function() {
        it('should post to stripe to create a charge', function(done) {
            var stripe = new Stripe('some key');
            var token = 'some token';
            var amount = 123.45;
            var amountInCents = parseInt(amount * 100);
            stripe.stripe = {
                charges: {
                    create: function(opt, cb) {
                        expect(opt.card).to.equal(token);
                        expect(opt.amount).to.equal(amountInCents);
                        expect(opt.currency).to.equal('cad');
                        cb();
                    }
                }
            }
            stripe.charge(token, amount, done);
        })
    })
})