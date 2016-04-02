var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookings.bind(this));
    app.get('/api/bookings/:id', app.checkAuth, app.checkAdmin, this.GetBooking.bind(this));
    app.get('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, this.GetSpotForBooking.bind(this));
    app.put('/api/bookings/:id/spot', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetSpotForBooking.bind(this));
    app.get('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, this.GetStartTimeForBooking.bind(this));
    app.put('/api/bookings/:id/start', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetStartTimeForBooking.bind(this));
    app.get('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, this.GetDurationForBooking.bind(this));
    app.put('/api/bookings/:id/duration', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetDurationForBooking.bind(this));
    app.get('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, this.GetEndTimeForBooking.bind(this));
    app.put('/api/bookings/:id/end', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetEndTimeForBooking.bind(this));
}

controller.prototype = {
    GetAllBookings: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    GetBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    GetSpotForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    SetSpotForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    GetStartTimeForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    SetStartTimeForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    GetDurationForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    SetDurationForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    GetEndTimeForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    },
    SetEndTimeForBooking: function(req, res) {
        res.status(500).send('Not implemented.');
    }
}

module.exports = controller;