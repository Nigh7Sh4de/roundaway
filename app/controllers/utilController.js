var Errors = require('./../errors');

var utilController = function(app) {
    this.app = app;
    app.post('/api/util/location/geocode', app.bodyParser.json(), this.Geocode.bind(this));
    app.post('/api/util/location/geocode/reverse', app.bodyParser.json(), this.ReverseGeocode.bind(this));
}

utilController.prototype = {
    Geocode: function(req, res, next) {
        app.geocoder.geocode(req.body.address)
        .then(function(result) {
            if (result.length < 1)
                throw new Error.NotFound('address', req.body.address);
            res.sendGood('Found coordinates', {
                longitude: result[0].longitude,
                latitude: result[0].latitude
            });
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    },
    ReverseGeocode: function(req, res, next) {
        app.geocoder.reverse({
            lon: req.body.longitude,
            lat: req.body.latitude
        })
        .then(function(result) {
            if (result.length < 1)
                throw new Error.NotFound('coordinates', req.body);
            res.sendGood('Found address', result[0].formattedAddress);
        })
        .catch(function(err) {
            res.sendBad(err);
        })
    }
}

module.exports = utilController;