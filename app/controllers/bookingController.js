var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkAdmin, this.GetBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, this.GetSpotForBooking.bind(this));
    app.put('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, this.GetStartOfBooking.bind(this));
    app.put('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetStartOfBooking.bind(this));
    app.get('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, this.GetDurationForBooking.bind(this));
    app.put('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetDurationForBooking.bind(this));
    app.get('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, this.GetEndOfBooking.bind(this));
    app.put('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetEndOfBooking.bind(this));
}

controller.prototype = {
    GetAllBookings: function(req, res) {
        this.app.db.bookings.find({}, function(err, docs) {
            if (err != null) {
                return res.status(500).send(err.message);
            }
            else {
                return res.send(docs);
            }
        });
    },
    GetBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            else
                return res.send(doc);
        })
    },
    GetSpotForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            var spotId = doc.getSpot();
            if (spotId instanceof Error)
                return res.status(500).send(spotId.message);
            this.app.db.spots.findById(spotId, function(spotErr, spotDoc) {
                if (spotErr != null)
                    return res.status(500).send(spotErr.message);
                else if (spotDoc == null)
                    return res.status(500).send('The spot associated with this booking does not exist.');
                else
                    return res.send(spotDoc);
            })
        }.bind(this))
    },
    SetSpotForBooking: function(req, res) {
        var booking, spot;
        var i = 0;
        var total = 2;
        var next = function(err) {
            if (err != null) {
                res.status(500).send(err);
                done = function() {}
                next = function() {}
            }
            if (++i >= total)
                done();
        }
        var done = function(err) {
            booking.setSpot(spot, function(err) {
                if (err != null)
                    res.status(500).send(err.message);    
                res.sendStatus(200);                
            });
        }
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return next(err.message);
            else if (doc == null)
                return next('Booking not found.');
            booking = doc;
            next();
        });
        this.app.db.spots.findById(req.body.id, function(spotErr, spotDoc) {
            if (spotErr != null)
                return next(spotErr.message);
            else if (spotDoc == null)
                return next('The spot you are trying to set does not exist.');
            spot = spotDoc;
            next();
        })
    },
    GetStartOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            res.send(doc.getStart());
        });
    },
    SetStartOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            doc.setStart(req.body.start, function(err) {
                if (err != null)
                    return res.status(500).send(err.message);
                res.sendStatus(200);
            })
        });
    },
    GetDurationForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            var dur = doc.getDuration();
            if (dur instanceof Error)
                return res.status(500).send(dur.message);
            res.send(dur.toString());
        })
    },
    SetDurationForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            doc.setDuration(req.body.duration, function(err) {
                    if (err != null)
                    return res.status(500).send(err.message);
                res.sendStatus(200);
            });
        })
    },
    GetEndOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            res.send(doc.getEnd());
        });
    },
    SetEndOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err != null)
                return res.status(500).send(err.message);
            else if (doc == null)
                return res.status(500).send('Booking not found.');
            doc.setEnd(req.body.end, function(err) {
                if (err != null)
                    return res.status(500).send(err.message);
                res.sendStatus(200);
            })
        });
    }
}

module.exports = controller;