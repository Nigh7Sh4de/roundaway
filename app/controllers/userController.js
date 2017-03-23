var Stripe = require('stripe');

var Errors = require('../errors');

var controller = function(app) {
    this.app = app;
    app.get('/api/users', app.checkAuth, app.checkOwner.bind(app), this.GetAllUsers.bind(this));
    app.get('/api/users/profile', app.checkAuth, app.checkOwner.bind(app), this.GetProfileOfUser.bind(this));
    app.patch('/api/users/profile', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.UpdateProfileOfUser.bind(this));
    app.get('/api/users/lots', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.GetLotsForUser.bind(this));
    app.get('/api/users/spots', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.GetSpotsForUser.bind(this));
    app.get('/api/users/bookings', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.GetBookingsForUser.bind(this));
    app.get('/api/users/stripe/account', app.checkAuth, app.checkOwner.bind(app), this.GetStripeAccountForUser.bind(this));
    app.get('/api/users/stripe/customer', app.checkAuth, app.checkOwner.bind(app), this.GetStripeCustomerForUser.bind(this));
    app.put('/api/users/stripe', app.checkAuth, app.checkOwner.bind(app), app.bodyParser.json(), this.UpdateStripeAccountForUser.bind(this));
    app.get('/api/users/stripe/history', app.checkAuth, app.checkOwner.bind(app), this.GetStripeTransactionsForUser.bind(this));
}

controller.prototype = {
    GetAllUsers: function(req, res) {
        return res.sendGood('Found users', req.docs);
    },
    GetProfileOfUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]
        return res.sendGood('Found profile for current session user', Object.assign({}, 
            user.profile.toJSON(),
            {authid: user.authid.toJSON()}
        ))
    },
    GetLotsForUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]
        this.app.db.lots.find({
            user: user.id
        })
        .exec()
        .then(function(lots) {
            res.sendGood('Found lots', lots);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetSpotsForUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]
        this.app.db.spots.find({
            user: user.id
        })
        .exec()
        .then(function(spots) {
            res.sendGood('Found spots', spots);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetBookingsForUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]
        this.app.db.bookings.find({
            user: user.id
        })
        .exec()
        .then(function(bookings) {
            res.sendGood('Found bookings', bookings);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    UpdateProfileOfUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]

        user.updateProfile(req.body)
        .then(function(user) {
            res.sendGood('Profile updated', user.profile)
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetStripeAccountForUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]
        
        if (!user.stripe || !user.stripe.acct)
            return res.sendBad(new Errors.MissingProperty(user, 'stripe'));
        app.stripe.getAccount(user.stripe.acct)
        .then(function(account) {
            res.sendGood('Found stripe account for user', account);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetStripeCustomerForUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]

        if (!user.stripe || !user.stripe.cus)
            return res.sendBad(new Errors.MissingProperty(user, 'stripe'));
        app.stripe.getCustomer(user.stripe.cus)
        .then(function(account) {
            res.sendGood('Found stripe customer for user', account);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    UpdateStripeAccountForUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]

        ;(
            !user.stripe || !user.stripe.acct ?
            app.stripe.createAccount(req.body) :
            app.stripe.updateAccount(user.stripe.acct, req.body) 
        ).then(function(account) {
            res.sendGood('Stripe account successfully created', account)
        })
        .catch(function(err) {
            res.sendBad(err)
        })
    },
    GetStripeTransactionsForUser: function(req, res) {
        if (req.docs.length > 1)
            return res.sendBad(new Errors.BadInput('_id'))
        var user = req.docs[0]
        
        if (!user.stripe || !user.stripe.acct)
            throw new Errors.MissingProperty(user, 'stripe')
        app.stripe.getHistory(user.stripe.acct)
        .then(function(transactions) {
            res.sendGood('Found transactions for user', transactions)
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    }
}

module.exports = controller;