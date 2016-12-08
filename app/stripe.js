var Stripe = require('stripe');
var Errors = require('./errors');

var stripe = function(stripe_key) {
    if (!stripe_key)
        throw new Errors.InvalidConfig('STRIPE_SECRET_KEY');
    this.stripe = Stripe(stripe_key);
}

stripe.prototype = {
    charge: function(source, destination, amount) {
        amount = parseInt(amount * 100);
        var charge = {
            amount: amount,
            currency: 'cad'
        }
        if (source.indexOf('cus_') === 0)
            charge.customer = source
        else
            charge.source = source
        if (destination) {
            charge.destination = destination;
            charge.application_fee = amount * (0.1 + 0.029) + 30
        }
        return this.stripe.charges.create(charge);
    },
    createAccount: function(account) {
        account = Object.assign(account, {
            managed: true
        })
        return this.stripe.accounts.create(account);
    },
    updateAccount: function(id, account) {
        return this.stripe.accounts.update(id, account);
    },
    getAccount: function(id) {
        return this.stripe.accounts.retrieve(id);
    },
    getHistory: function(id) {
        return this.stripe.balance.listTransactions({
            stripe_account: id,
            limit: 10
        });
    },
    createCustomer: function(source) {
        return this.stripe.customers.create({ source });
    }
}

module.exports = stripe;