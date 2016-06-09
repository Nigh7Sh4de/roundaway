var controller = function(app) {
    this.app = app;
    app.get('/api/users', app.checkAuth, app.checkAdmin, this.GetAllUsers.bind(this));
    app.get('/api/users/profile', app.checkAuth, this.GetProfileForSessionUser.bind(this));

    app.get('/api/users/:id/lots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetLotsForUser.bind(this));
    app.put('/api/users/:id/lots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddLotsToUser.bind(this));

    app.get('/api/users/:id/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetSpotsForUser.bind(this));
    app.put('/api/users/:id/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddSpotsToUser.bind(this));
    
    app.get('/api/users/:id/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetBookingsForUser.bind(this));
    app.put('/api/users/:id/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddBookingsToUser.bind(this));
    
    app.get('/api/users/:id/profile', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetProfileForUser.bind(this));
    app.patch('/api/users/:id/profile', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.UpdateProfileForfUser.bind(this));
}

controller.prototype = {
    GetAllUsers: function(req, res) {
        this.app.db.users.find({}, function(err, docs) {
            if (err)
                return res.sendBad(err);
            else {
                return res.sendGood('Found users', {users: docs});
            }
        });
    },
    GetProfileForSessionUser: function(req, res) {
        if (req.user == null)
            return res.sendBad('Could not get session user');
        return res.sendGood('Found profile for current session user', { 
            profile: (Object.assign({}, req.user.profile.toJSON(), 
            {
                authid: req.user.authid.toJSON()
            }))
        });
    },
    GetLotsForUser: function(req, res) {
        this.app.db.users.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            if (doc == null)
                return res.sendBad('Could not get lots for user because this user was not found');
                                
            res.sendGood('Found lots for user', {lots: doc.lotIds});
        })
    },
    AddLotsToUser: function(req, res) {
        if (req.body.lots == null)
            return res.sendBad('Could not add lots as no lots were specified');
        var count = 2;
        var i = 0;
        var next = function() {
            if (++i >= count)
                done();
        }
        var done = function() {
            user.addLot(lots, function(err, count) {
                var msg = count + ' lot' + (count != 1 ? 's' : '') + ' added to user';
                if (err) {
                    msg += '\nERRORS: \n'
                    err.forEach(function (e) {
                        msg += e + '\n';
                    })
                    return res.sendBad(msg);
                }
                res.sendGood(msg);
            });
        }
        var user = null;
        var lots = null;
        this.app.db.users.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            if (doc == null)
                return res.sendBad('Could not add lot because this user was not found');
            user = doc;
            next();
        });
        if (typeof req.body.lots == 'string')
            req.body.lots = [req.body.lots];
        this.app.db.lots.find({_id: {$in: req.body.lots}}, function(err, docs) {
            if (err)
                return res.sendBad(err);
            if (docs.length == 0)
                return res.sendBad('Could not add lot as this lot was not found');
            lots = docs;
            next();
        })
    },
    GetSpotsForUser: function(req, res) {
        this.app.db.users.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            if (doc == null)
                return res.sendBad('Could not get lots for user as this user was not found');
                                
            res.sendGood('Found spots', {spots: doc.spotIds});
        })
    },
    AddSpotsToUser: function(req, res) {
        if (req.body.spots == null)
            return res.sendBad('Could not add spots as no spots were specified');
        var count = 2;
        var i = 0;
        var next = function() {
            if (++i >= count)
                done();
        }
        var done = function() {
            user.addSpot(spots, function(err, count) {
                var msg = count + ' spot' + (count != 1 ? 's' : '') + ' added to user';
                if (err) {
                    msg += '\nERRORS: \n'
                    err.forEach(function (e) {
                        msg += e + '\n';
                    })
                    return res.sendBad(msg);
                }
                res.sendGood(msg);
            });
        }
        var user = null;
        var spots = null;
        this.app.db.users.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            if (doc == null)
                return res.sendBad('Could not add spot as this user was not found');
            user = doc;
            next();
        });
        if (typeof req.body.spots == 'string')
            req.body.spots = [req.body.spots];
        this.app.db.spots.find({_id: {$in: req.body.spots}}, function(err, docs) {
            if (err)
                return res.sendBad(err);
            if (docs.length == 0)
                return res.sendBad('Could not add spot as this spot was not found');
            spots = docs;
            next();
        })
    },
    GetBookingsForUser: function(req, res) {
        this.app.db.users.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            if (doc == null)
                return res.sendBad('Could not get lots for user as this user was not found');
                                
            res.sendGood('Fonud bookings', {bookings: doc.bookingIds});
        })
    },
    AddBookingsToUser: function(req, res) {
        if (req.body.bookings == null)
            return res.sendBad('Could not add bookings since no bookings were specified');
        var count = 2;
        var i = 0;
        var next = function() {
            if (++i >= count)
                done();
        }
        var done = function() {
            user.addBooking(bookings, function(err, count) {
                var msg = count + ' booking' + (count != 1 ? 's' : '') + ' added to user';
                if (err) {
                    msg += '\nERRORS: \n'
                    err.forEach(function (e) {
                        msg += e + '\n';
                    })
                    return res.sendBad(msg);
                }
                res.sendGood(msg);
            });
        }
        var user = null;
        var bookings = null;
        this.app.db.users.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            if (doc == null)
                return res.sendBad('Could not add booking as this user was not found');
            user = doc;
            next();
        });
        if (typeof req.body.bookings == 'string')
            req.body.bookings = [req.body.bookings];
        this.app.db.bookings.find({_id: {$in: req.body.bookings}}, function(err, docs) {
            if (err)
                return res.sendBad(err);
            if (docs.length == 0)
                return res.sendBad('Could not add booking because this booking was not found');
            bookings = docs;
            next();
        })
    },
    UpdateProfileForfUser: function(req, res) {
        this.app.db.users.findById(req.params.id, function(err, user) {
            if (err)
                return res.sendBad(err);
            if (user == null)
                return res.sendBad('Could not update user as this user was not found');

            user.updateProfile(req.body, function(err) {
                if (err)
                    return res.sendBad(err);
                res.sendGood('Profile updated', {profile: user.profile})
            });
        })
    },
    GetProfileForUser: function(req, res) {
        this.app.db.users.findById(req.params.id, function(err, doc) {
            if (err)
                return res.sendBad(err);
            if (doc == null)
                return res.sendBad('Could not get profile for user as this user was not found');
                                
            res.sendGood('Found profile for user', {profile: doc.profile});
        })
    }
}

module.exports = controller;