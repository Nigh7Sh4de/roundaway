var controller = function(app) {
    this.app = app;
    app.get('/api/bookings', app.checkAuth, app.checkAdmin, this.GetAllBookings.bind(this));

}

controller.prototype = {
    GetAllBookings: function(req, res) {
        res.status(500).send('Not implemented.');
    }
}

module.exports = controller;