var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAdmin, this.GetAllLots.bind(this));
}

controller.prototype = {
    GetAllLots: function(req, res) {
        res.sendStatus(501);
    }
}

module.exports = controller;