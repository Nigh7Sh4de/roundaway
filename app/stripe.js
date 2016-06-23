var Stripe = require('stripe');

var stripe = function(stripe_key) {
    this.stripe = Stripe(stripe_key);
}

stripe.prototype = {

}

module.exports = stripe;