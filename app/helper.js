var helper = function() {}

helper.prototype = {
    init: function(obj) {
        var proto = Object.getPrototypeOf(this);
        var x = {};
        Object.assign(x, proto, this);
        delete x.init;
        Object.assign(obj, x);
    },

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

    checkAuth: function(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    },

    checkAdmin: function(req, res, next) {
        if (req.user.admin)
            return next();
        res.redirect('/home');
    }
}

module.exports = helper;