var controller = function(app) {
    this.app = app;
    app.get('/api/pay', app.checkAuth, app.checkAdmin, this.SayHi.bind(this));
}

controller.prototype = {
    SayHi: function(req, res) {
        res.sendGood("HI");
    }
}

module.exports = controller;