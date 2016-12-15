var Stripe = require('stripe');

var Errors = require('../errors');

var controller = function(app) {
    this.app = app;
    app.get('/api/users', app.checkAuth, app.checkAdmin.bind(app), this.GetAllUsers.bind(this));
    app.get('/api/users/profile', app.checkAuth, this.GetProfileOfSessionUser.bind(this));
    app.get('/api/users/:id/lots', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetLotsForUser.bind(this));
    app.get('/api/users/:id/spots', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetSpotsForUser.bind(this));
    app.get('/api/users/:id/bookings', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetBookingsForUser.bind(this));
    app.get('/api/users/:id/profile', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetProfileOfUser.bind(this));
    app.patch('/api/users/:id/profile', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.UpdateProfileOfUser.bind(this));
    app.get('/api/users/:id/stripe/account', app.checkAuth, app.checkAdmin.bind(app), this.GetStripeAccountForUser.bind(this));
    app.get('/api/users/:id/stripe/customer', app.checkAuth, app.checkAdmin.bind(app), this.GetStripeCustomerForUser.bind(this));
    app.post('/api/users/:id/stripe', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.UpdateStripeAccountForUser.bind(this));
    app.get('/api/users/:id/stripe/history', app.checkAuth, app.checkAdmin.bind(app), this.GetStripeTransactionsForUser.bind(this));
}

controller.prototype = {
    GetAllUsers: function(req, res) {
        this.app.db.users.find({})
        .exec()
        .then(function (users) {
            return res.sendGood('Found users', users);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetProfileOfSessionUser: function(req, res) {
        if (req.user == null)
            return res.sendBad('Could not get session user');
        return res.sendGood('Found profile for current session user', 
                Object.assign({}, req.user.profile.toJSON(),{authid: req.user.authid.toJSON()})
            )
    },
    GetLotsForUser: function(req, res) {
        this.app.db.lots.find({
            user: req.params.id
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
        this.app.db.spots.find({
            user: req.params.id
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
        this.app.db.bookings.find({
            user: req.params.id
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
        this.app.db.users.findById(req.params.id)
        .exec()
        .then(function(user) {
            return user.updateProfile(req.body)
        })
        .then(function(user) {
            res.sendGood('Profile updated', user.profile)
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetProfileOfUser: function(req, res) {
        this.app.db.users.findById(req.params.id)
        .exec()
        .then(function(user) {
            res.sendGood('Found profile for user', user.profile);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetStripeAccountForUser: function(req, res) {
        this.app.db.users.findById(req.params.id)
        .exec()
        .then(function(user) {
            if (!user.stripe || !user.stripe.stripe_id)
                throw new Errors.MissingProperty(user, 'stripe');
            return app.stripe.getAccount(user.stripe.stripe_id);
        })
        .then(function(account) {
            res.sendGood('Found stripe account for user', account);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetStripeCustomerForUser: function(req, res) {
        this.app.db.users.findById(req.params.id)
        .exec()
        .then(function(user) {
            if (!user.stripe || !user.stripe.customer_id)
                throw new Errors.MissingProperty(user, 'stripe');
            return app.stripe.getCustomer(user.stripe.customer_id);
        })
        .then(function(account) {
            res.sendGood('Found stripe customer for user', account);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    UpdateStripeAccountForUser: function(req, res) {
        this.app.db.users.findById(req.params.id)
        .exec()
        .then(function(user) {
            (
                !user.stripe || !user.stripe.stripe_id ?
                app.stripe.createAccount(req.body) :
                app.stripe.updateAccount(user.stripe.stripe_id, req.body) 
            ).then(function(account) {
                res.sendGood('Stripe account successfully created', account)
            })
            .catch(function(err) {
                res.sendBad(err)
            })
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    GetStripeTransactionsForUser: function(req, res) {
        this.app.db.users.findById(req.params.id)
        .exec()
        .then(function(user) {
            if (!user.stripe || !user.stripe.stripe_id)
                throw new Errors.MissingProperty(user, 'stripe')
            return app.stripe.getHistory(user.stripe.stripe_id);
        })
        .then(function(transactions) {
            res.sendGood('Found transactions for user', transactions)
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    }
}

module.exports = controller;