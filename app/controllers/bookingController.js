var Booking = require('./../models/Booking');

var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkAdmin, this.GetBooking.bind(this));
    app.put('/api/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, this.GetSpotForBooking.bind(this));
    app.put('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, this.GetStartOfBooking.bind(this));
    app.put('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetStartOfBooking.bind(this));
    app.get('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, this.GetDurationForBooking.bind(this));
    app.put('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetDurationForBooking.bind(this));
    app.get('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, this.GetEndOfBooking.bind(this));
    app.put('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetEndOfBooking.bind(this));
    app.get('/api/bookings/:id/time', app.checkAuth, app.checkAdmin, this.GetTimeOfBooking.bind(this));
    app.put('/api/bookings/:id/time', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetTimeOfBooking.bind(this));
}

controller.prototype = {
    GetAllBookings: function(req, res) {
        this.app.db.bookings.find({}, function(err, docs) {
            if (err) {
                return res.status(500).send(err);
            }
            else {
                return res.send(docs);
            }
        });
    },
    GetBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            else
                return res.send(doc);
        })
    },
    CreateBooking: function(req, res) {
        var newBooking = new Booking(req.body.booking).toJSON();
        delete newBooking._id;
        if (req.body.count != null) {
            if (typeof req.body.count !== 'number' || req.body.count <= 0)
                return res.status(500).send('Could not create booking. Specified count was invalid.');
            var arr = [];
            for (var i=0;i<req.body.count;i++)
                arr.push(newBooking);
            this.app.db.bookings.collection.insert(arr, function(err, result) {
                if (err)
                    return res.send({status: 'ERROR', error: err});
                res.send({status: 'SUCCESS', result: result});
            })
        }
        else {
            this.app.db.bookings.create(newBooking, function(err, result) {
                if (err)
                    return res.send({status: 'ERROR', error: err});
                res.send({status: 'SUCCESS', result: result});
            })    
        }
        
    },
    GetSpotForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            var spotId = doc.getSpot();
            if (spotId instanceof Error)
                return res.status(500).send(spotId);
            this.app.db.spots.findById(spotId, function(spotErr, spotDoc) {
                if (spotErr != null)
                    return res.status(500).send(spotErr);
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
            if (err) {
                res.status(500).send(err);
                done = function() {}
                next = function() {}
            }
            if (++i >= total)
                done();
        }
        var done = function(err) {
            booking.setSpot(spot, function(err) {
                if (err)
                    res.status(500).send(err);    
                res.sendStatus(200);                
            });
        }
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return next(err);
            else if (!doc)
                return next('Booking not found.');
            booking = doc;
            next();
        });
        this.app.db.spots.findById(req.body.id, function(spotErr, spotDoc) {
            if (spotErr != null)
                return next(spotErr);
            else if (spotDoc == null)
                return next('The spot you are trying to set does not exist.');
            spot = spotDoc;
            next();
        })
    },
    GetStartOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            res.send(doc.getStart());
        });
    },
    SetStartOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            doc.setStart(req.body.start, function(err) {
                if (err)
                    return res.status(500).send(err);
                res.sendStatus(200);
            })
        });
    },
    GetDurationForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            var dur = doc.getDuration();
            if (!dur)
                return res.status(500).send('This booking does not have valid start and/or end dates. Start: ' + doc.getStart() + ', End: ' + doc.getEnd());
            res.send(dur.toString());
        })
    },
    SetDurationForBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            doc.setDuration(req.body.duration, function(err) {
                    if (err)
                    return res.status(500).send(err);
                res.sendStatus(200);
            });
        })
    },
    GetEndOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            res.send(doc.getEnd());
        });
    },
    SetEndOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            doc.setEnd(req.body.end, function(err) {
                if (err)
                    return res.status(500).send(err);
                res.sendStatus(200);
            })
        });
    },
    GetTimeOfBooking: function(req, res) {
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            else {
                res.send({
                    start: doc.getStart() || 'This booking does not have a start time',
                    end: doc.getEnd() || 'This booking does not have a start time',
                })
            }
        });
    },
    SetTimeOfBooking: function(req, res) {
        if (!req.body.start && !req.body.end)
            return res.status(500).send('Cannot set time of booking. Must specify start and/or end times.');
        this.app.db.bookings.findById(req.params.id, function(err, doc) {
            if (err)
                return res.status(500).send(err);
            else if (!doc)
                return res.status(500).send('Booking not found.');
            else {
                var errs = [];
                var count = 0;
                var next = function(err) {
                    count++;
                    if (err)
                        errs.push(err);
                    if (count >= 2)
                        done();
                }
                var done = function() {
                    if (errs.length == 0)
                        res.sendStatus(200);
                    else
                        res.status(500).send(errs);
                }
                if (req.body.start)
                    doc.setStart(req.body.start, next);
                else count++;
                if (req.body.end)
                    doc.setEnd(req.body.end, next);
                else count++;
            }
        });
    }
}

module.exports = controller;