var controller = function(app) {
    this.app = app;
    app.get('/api/spots', app.checkAuth, app.checkAdmin, this.GetAllSpots.bind(this))
}

controller.prototype = {
    GetAllSpots: function(req, res) {
        this.app.db.spots.find({}, function(err, docs) {
            return res.send(docs);
        });
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