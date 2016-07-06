var helper = function() {}

helper.prototype = {
    init: function(obj) {
        var proto = Object.getPrototypeOf(this);
        var x = {};
        Object.assign(x, proto, this);
        delete x.init;
        var middleware = x.middleware;
        delete x.middleware;
        Object.assign(obj, x);

        if (middleware.length > 0)
            obj.use.apply(obj, middleware);
    },

    middleware: [],

    start: function(cb) {
        this.listen(this.config.PORT, cb || this.started);
    },

    started: function() {
        console.log('Roundaway started on port ' + this.address().port);
    },

    allowGet: function(file) {
        this.get(file, function(req, res) {
            return res.sendFile(file, { root: __dirname + '/..' });
        });
    },

    sendIndex: function(req, res) {
        return res.sendFile('/public/index.html', { root: __dirname + '/..' });
    },

    checkAuth: function() {
        return function(req, res, next) {
            this.app.passport.authenticate('jwt', {session: false})(req, res, next);
        }.bind(this)
    }(),

    checkAdmin: function(req, res, next) {
        if (req.user.admin)
            return next();
        res.status(401).send('You do not have the required privelages to access this resource');
    }
}

module.exports = helper;