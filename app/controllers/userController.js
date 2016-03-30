var controller = function(app) {
    this.app = app;
    app.get('/api/users', app.checkAuth, app.checkAdmin, this.GetAllUsers.bind(this));
    app.get('/api/users/profile', app.checkAuth, this.GetProfileForSessionUser.bind(this));

    app.get('/api/users/:userid/lots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetLotsForUser.bind(this));
    app.put('/api/users/:userid/lots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddLotsToUser.bind(this));

    app.get('/api/users/:userid/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetSpotsForUser.bind(this));
    app.put('/api/users/:userid/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddSpotsToUser.bind(this));
    
    app.get('/api/users/:userid/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetBookingsForUser.bind(this));
    app.put('/api/users/:userid/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AddBookingsToUser.bind(this));
    
    app.get('/api/users/:userid/profile', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetProfileForUser.bind(this));
    app.patch('/api/users/:userid/profile', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.UpdateProfileForfUser.bind(this));
}

controller.prototype = {
    GetAllUsers: function(req, res) {
        this.app.db.users.find({}, function(err, docs) {
            if (err != null) {
                return res.send({err: err});
            }
            else {
                return res.send(docs);
            }
        });
    },
    GetProfileForSessionUser: function(req, res) {
        if (req.user == null)
            return res.status(500).send('Could not get session user.');
        return res.send(Object.assign({}, req.user.profile.toJSON(), {authid: req.user.authid.toJSON()}));
    },
    GetLotsForUser: function(req, res) {
        this.app.db.users.findById(req.params.userid, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            if (doc == null)
                return res.status(500).send('Could not get lots for user. User not found.');
                                
            res.send(doc.lotIds);
        })
    },
    AddLotsToUser: function(req, res) {
        if (req.body.lots == null)
            return res.status(500).send('Could not add lots. No lots specified.');
        var count = 2;
        var i = 0;
        var next = function() {
            if (++i >= count)
                done();
        }
        var done = function() {
            user.addLot(lots, function(err, count) {
                var msg = count + ' lot' + (count != 1 ? 's' : '') + ' added to user.';
                if (err != null) {
                    msg += '\nERRORS: \n'
                    err.forEach(function (e) {
                        msg += e + '\n';
                    })
                    return res.status(500).send(msg);
                }
                res.status(200).send(msg);
            });
        }
        var user = null;
        var lots = null;
        this.app.db.users.findById(req.params.userid, function(err, doc) {
            if (err != null)
                return res.send(err);
            if (doc == null)
                return res.status(500).send('Could not add lot. User not found.');
            user = doc;
            next();
        });
        if (typeof req.body.lots == 'string')
            req.body.lots = [req.body.lots];
        this.app.db.lots.find({_id: {$in: req.body.lots}}, function(err, docs) {
            if (err != null)
                return res.send(err);
            if (docs.length == 0)
                return res.status(500).send('Could not add lot. Lot not found.');
            lots = docs;
            next();
        })
    },
    GetSpotsForUser: function(req, res) {
        this.app.db.users.findById(req.params.userid, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            if (doc == null)
                return res.status(500).send('Could not get lots for user. User not found.');
                                
            res.send(doc.spotIds);
        })
    },
    AddSpotsToUser: function(req, res) {
        if (req.body.spots == null)
            return res.status(500).send('Could not add spots. No spots specified.');
        var count = 2;
        var i = 0;
        var next = function() {
            if (++i >= count)
                done();
        }
        var done = function() {
            user.addSpot(spots, function(err, count) {
                var msg = count + ' spot' + (count != 1 ? 's' : '') + ' added to user.';
                if (err != null) {
                    msg += '\nERRORS: \n'
                    err.forEach(function (e) {
                        msg += e + '\n';
                    })
                    return res.status(500).send(msg);
                }
                res.status(200).send(msg);
            });
        }
        var user = null;
        var spots = null;
        this.app.db.users.findById(req.params.userid, function(err, doc) {
            if (err != null)
                return res.send(err);
            if (doc == null)
                return res.status(500).send('Could not add spot. User not found.');
            user = doc;
            next();
        });
        if (typeof req.body.spots == 'string')
            req.body.spots = [req.body.spots];
        this.app.db.spots.find({_id: {$in: req.body.spots}}, function(err, docs) {
            if (err != null)
                return res.send(err);
            if (docs.length == 0)
                return res.status(500).send('Could not add spot. Spot not found.');
            spots = docs;
            next();
        })
    },
    GetBookingsForUser: function(req, res) {
        this.app.db.users.findById(req.params.userid, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            if (doc == null)
                return res.status(500).send('Could not get lots for user. User not found.');
                                
            res.send(doc.bookingIds);
        })
    },
    AddBookingsToUser: function(req, res) {
        if (req.body.bookings == null)
            return res.status(500).send('Could not add bookings. No bookings specified.');
        var count = 2;
        var i = 0;
        var next = function() {
            if (++i >= count)
                done();
        }
        var done = function() {
            user.addBooking(bookings, function(err, count) {
                var msg = count + ' booking' + (count != 1 ? 's' : '') + ' added to user.';
                if (err != null) {
                    msg += '\nERRORS: \n'
                    err.forEach(function (e) {
                        msg += e + '\n';
                    })
                    return res.status(500).send(msg);
                }
                res.status(200).send(msg);
            });
        }
        var user = null;
        var bookings = null;
        this.app.db.users.findById(req.params.userid, function(err, doc) {
            if (err != null)
                return res.send(err);
            if (doc == null)
                return res.status(500).send('Could not add booking. User not found.');
            user = doc;
            next();
        });
        if (typeof req.body.bookings == 'string')
            req.body.bookings = [req.body.bookings];
        this.app.db.bookings.find({_id: {$in: req.body.bookings}}, function(err, docs) {
            if (err != null)
                return res.send(err);
            if (docs.length == 0)
                return res.status(500).send('Could not add booking. Booking not found.');
            bookings = docs;
            next();
        })
    },
    UpdateProfileForfUser: function(req, res) {
        this.app.db.users.findById(req.params.userid, function(err, user) {
            if (err != null)
                return res.status(500).send(err.message);
            if (user == null)
                return res.status(500).send('Could not update user. User not found.');

            user.updateProfile(req.body, function(err) {
                if (err != null)
                    return res.status(500).send(err.message);
                res.status(200).send('User profile updated.\n' + JSON.stringify(user.profile));
            });
        })
    },
    GetProfileForUser: function(req, res) {
        this.app.db.users.findById(req.params.userid, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            if (doc == null)
                return res.status(500).send('Could not get profile for user. User not found.');
                                
            res.send(doc.profile);
        })
    }
}

module.exports = controller;