var Errors = require('./../errors');

var utilController = function(app) {
    this.app = app;
    app.post('/api/util/location/geocode', app.bodyParser.json(), this.Geocode.bind(this));
}

utilController.prototype = {
    Geocode: function(req, res, next) {
        if (!req.body.address || typeof req.body.address !== 'string')
            return res.sendBad(new Errors.BadInput('address'));
        app.geocoder.geocode(req.body.address)
        .then(function(result) {
            if (result.length < 1)
                throw new Error.NotFound('address', req.body.address);
            res.sendGood('Found coordinates', result.map(function(place) { 
                return place.formattedAddress 
            }));
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    }
}

module.exports = utilController;