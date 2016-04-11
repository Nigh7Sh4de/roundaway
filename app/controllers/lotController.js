var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAdmin, this.GetAllLots.bind(this));
}

controller.prototype = {
    GetAllLots: function(req, res) {
        this.app.db.lots.find({}, function(err, docs) {
            if (err != null) {
                return res.status(500).send(err.message);
            }
            else {
                return res.send(docs);
            }
        })
    }
}

module.exports = controller;