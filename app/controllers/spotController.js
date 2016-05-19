var controller = function(app) {
    this.app = app;
    app.get('/api/spots', app.checkAuth, app.checkAdmin, this.GetAllSpots.bind(this));
    app.put('/api/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.CreateSpot.bind(this));
    app.get('/api/spots/:id', app.checkAuth, app.checkAdmin, this.GetSpot.bind(this));
    app.get('/api/spots/:id/location', app.checkAuth, app.checkAdmin, this.GetLocationForSpot.bind(this));
    app.post('/api/spots/:id/location', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetLocationForSpot.bind(this));
    app.get('/api/spots/:id/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookingsForSpot.bind(this));
    app.put('/api/spots/:id/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AdBookingsToSpot.bind(this));
    app.delete('/api/spots/:id/bookings', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.RemoveBookingsFromSpot.bind(this));
    app.get('/api/spots/:id/available', app.checkAuth, app.checkAdmin, this.GetAllAvailabilityForSpot.bind(this));
    app.put('/api/spots/:id/available', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.AdAvailabilityToSpot.bind(this));
    app.delete('/api/spots/:id/available', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.RemoveAvailabilityFromSpot.bind(this));
    app.get('/api/spots/:id/booked', app.checkAuth, app.checkAdmin, this.GetAllBookedTimeForSpot.bind(this));
    app.get('/api/spots/:id/schedule', app.checkAuth, app.checkAdmin, this.GetEntireScheduleForSpot.bind(this));
}

controller.prototype = {
    GetAllSpots: function(req, res) {
        this.app.db.spots.find({}, function(err, docs) {
            return res.send(docs);
        });
    },
    CreateSpot: function(req, res) {
        
    },
    GetSpot: function(req, res) {
        
    },
    GetLocationForSpot: function(req, res) {
        
    },
    SetLocationForSpot: function(req, res) {
        
    },
    GetAllBookingsForSpot: function(req, res) {
        
    },
    AdBookingsToSpot: function(req, res) {
        
    },
    RemoveBookingsFromSpot: function(req, res) {
        
    },
    GetAllAvailabilityForSpot: function(req, res) {
        
    },
    AdAvailabilityToSpot: function(req, res) {
        
    },
    RemoveAvailabilityFromSpot: function(req, res) {
        
    },
    GetAllBookedTimeForSpot: function(req, res) {
        
    },
    GetEntireScheduleForSpot: function(req, res) {
        
    }
}

var init = function(app) {
    app.get('/api/spots/near', app.checkAuth, app.checkAdmin, function(req, res)  {
        if (isNaN(req.query.long) || isNaN(req.query.lat))
            return res.send("Got invalid coordinates");

        var coordinates = [
            parseFloat(req.query.long),
            parseFloat(req.query.lat)
        ];

        app.db.find('spots', {location: {$near:{$geometry:{ type: "Point", coordinates: coordinates }}}}, function(err, doc) {
            if (err != null)
                return res.send(err);
            else {
                return res.send(doc);
            }
        });

    });

    app.put('/api/spots', app.checkAuth, app.checkAdmin, app.bodyParser.json(), function(req, res) {
        if (req.body.address == null)
            return res.send("address cannot be null");
        else if (req.body.coordinates == null || req.body.coordinates == {})
            return res.send("location cannot be null or empty");
        else
            app.db.createSpot(req.body, function(err) {
                if (err != null)
                    return res.send(err);
                else {
                    return res.sendStatus(200);
                }
            });
    });
}

module.exports = controller;