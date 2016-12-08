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
    describe('updateAccount', function(account) {
        it('should create a new managed account', function() {
            var stripe = new Stripe('some key');
            stripe.stripe = {
                accounts: {
                    update: function(id, opt) {
                        return Promise.resolve(Object.assign(opt, {id}))
                    }
                }
            }
            var account_details = {
                country: 'SOMECOUNTRY'
            }
            var account_id = 'some stripe id';
            return stripe.updateAccount(account_id, account_details).then(function(opt) {
                expect(opt.id).to.equal(account_id);
                expect(opt.country).to.equal(account_details.country)
            })
        })
    })
    describe('createAccount', function(account) {
        it('should create a new managed account', function() {
            var stripe = new Stripe('some key');
            stripe.stripe = {
                accounts: {
                    create: function(opt) {
                        return Promise.resolve(opt)
                    }
                }
            }
            var account_details = {
                country: 'SOMECOUNTRY'
            }
            return stripe.createAccount(account_details).then(function(opt) {
                expect(opt.country).to.equal(account_details.country)
                expect(opt.managed).to.be.true;
            })
        })
    })
    describe('getAccount', function() {
        it('should retrieve the stripe account', function() {
            var stripe = new Stripe('some key');
            stripe.stripe = {
                accounts: {
                    retrieve: function(opt) {
                        return Promise.resolve(opt)
                    }
                }
            }
            var id = 'some stripe id'
            return stripe.getAccount(id).then(function(opt) {
                expect(opt).to.equal(id)
            })
        })
    })
    describe('getHistory', function() {
        it('should get balance history for an account', function() {
            var stripe = new Stripe('some key');
            stripe.stripe = {
                balance: {
                    listTransactions: function(opt) {
                        return Promise.resolve(opt)
                    }
                }
            }
            var id = 'some stripe id'
            return stripe.getHistory(id).then(function(opt) {
                expect(opt.stripe_account).to.equal(id);
            })
        })
    })

    describe('charge', function() {
        it('should use a destination if provided', function() {
            var stripe = new Stripe('some key');
            var token = 'some token';
            var amount = 123.45;
            var amountInCents = parseInt(amount * 100);
            var destination = 'some stripe id'
            stripe.stripe = {
                charges: {
                    create: function(opt) {
                        return Promise.resolve(opt);
                    }
                }
            }
            return stripe.charge(token, destination, amount).then(function(opt) {
                expect(opt.card).to.equal(token);
                expect(opt.amount).to.equal(amountInCents);
                expect(opt.currency).to.equal('cad');
                expect(opt.destination).to.equal(destination);
            })
        })
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
            return stripe.charge(token, null, amount).then(function(opt) {
                expect(opt.card).to.equal(token);
                expect(opt.amount).to.equal(amountInCents);
                expect(opt.currency).to.equal('cad');
            })
        })
    })
})