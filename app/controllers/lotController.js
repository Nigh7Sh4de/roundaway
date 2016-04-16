var request = require('request');

var controller = function(app) {
    this.app = app;
    app.get('/api/lots', app.checkAuth, app.checkAdmin, this.GetAllLots.bind(this));
    app.put('/api/lots/:id/location', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.SetLocationOfLot.bind(this));
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
    },
    SetLocationOfLot: function(req, res) {
        var coords = req.body.coordinates;
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyDzO69_6QM_qkhczIvkFrmWtjXkg3CTFIE';
        request(url, function(err, response, body) {
            console.log(body);
            res.sendStatus(501);
        })
    }
}

module.exports = controller;