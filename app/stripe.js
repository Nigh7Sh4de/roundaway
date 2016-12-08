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
            card: source,
            amount: amount,
            currency: 'cad'
        }
        if (destination) {
            charge.destination = destination;
            charge.application_fee = amount * (0.1 + 0.029) + 30
        }
        return this.stripe.charges.create(charge);
    }
}

module.exports = stripe;