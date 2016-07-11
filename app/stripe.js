var Stripe = require('stripe');

var stripe = function(stripe_key) {
    if (!stripe_key)
        throw new Error('Must supply stripe key');
    this.stripe = Stripe(stripe_key);
}

stripe.prototype = {
    charge: function(token, amount) {
        amount = parseInt(amount * 100);
        return this.stripe.charges.create({
            card: token,
            amount: amount,
            currency: 'cad'
        });
    }
}

module.exports = stripe;