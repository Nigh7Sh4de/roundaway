var jwt = require('jsonwebtoken');
var URL = require('url');

var authController = function(app) {
    this.app = app;
    app.put('/auth/:strat', app.bodyParser.json(), this.Authenticate.bind(this));
}

authController.prototype = {
    Authenticate: function(req, res, next) {
        var config = this.app.config;
        this.app.passport.authenticate(
            req.params.strat + '-token',  
            function(err, user, info) {
                if (err)
                    return res.sendBad(err);
                if (info && info.stack)
                    return res.sendBad(info);
                if (!user)
                    return res.sendBad(['User could not be authenticated', info]);
                var token = jwt.sign({id: user.id, profile: user.profile}, config.JWT_SECRET_KEY);
                res.sendGood('User authenticated successfuly', token);
            }
        )(req, res, next);
    }
}

module.exports = authController;