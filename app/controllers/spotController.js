var init = function(app, db, checkAuth, checkAdmin, bodyParser) {
    app.get('/api/spots', checkAuth, checkAdmin, function(req, res) {
        db.find('spots', {}, function(err, docs) {
            return res.send(docs);
        });
    });

    app.get('/api/spots/near', checkAuth, checkAdmin, function(req, res)  {
        if (isNaN(req.query.long) || isNaN(req.query.lat))
            return res.send("Got invalid coordinates");

        var coordinates = [
            parseFloat(req.query.long),
            parseFloat(req.query.lat)
        ];

        db.find('spots', {location: {$near:{$geometry:{ type: "Point", coordinates: coordinates }}}}, function(err, doc) {
            if (err != null)
                return res.send(err);
            else {
                return res.send(doc);
            }
        });

    });

    app.put('/api/spots', checkAuth, checkAdmin, bodyParser.json(), function(req, res) {
        if (req.body.address == null)
            return res.send("address cannot be null");
        else if (req.body.coordinates == null || req.body.coordinates == {})
            return res.send("location cannot be null or empty");
        else
            db.createSpot(req.body, function(err) {
                if (err != null)
                    return res.send(err);
                else {
                    return res.sendStatus(200);
                }
            });
    });
}

module.exports = {
    init: init
};