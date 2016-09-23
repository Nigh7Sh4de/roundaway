var controller = function(app) {
    this.app = app;
    app.get('/api/users', app.checkAuth, app.checkAdmin.bind(app), this.GetAllUsers.bind(this));
    app.get('/api/users/profile', app.checkAuth, this.GetProfileOfSessionUser.bind(this));
    app.get('/api/users/:id/lots', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetLotsForUser.bind(this));
    app.get('/api/users/:id/spots', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetSpotsForUser.bind(this));
    app.get('/api/users/:id/bookings', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetBookingsForUser.bind(this));
    app.get('/api/users/:id/profile', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.GetProfileOfUser.bind(this));
    app.patch('/api/users/:id/profile', app.checkAuth, app.checkAdmin.bind(app), app.bodyParser.json(), this.UpdateProfileOfUser.bind(this));
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
    }
}

module.exports = controller;