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
        res.sendBad('You do not have the required privelages to access this resource', null, {status: 401});
    },

    checkOwner: function(req, res, next) {
        var slash_api = '/api/'.length;
        var slash = req.url.indexOf('/', slash_api);
        var collection = req.url.substring(slash_api, slash);
        var id = req.url.substr(slash+1, 24);
        app.db[collection].findById(id).then(function(doc) {
            if (!doc)
                throw 'Could not find document with id ' + id + ' in collection ' + collection;
            else if (req.user.admin ||
                     collection === 'users' && doc.id == req.user.id ||
                     doc.user == req.user.id) 
            {
                req.doc = doc;
                next();
            }
            else
                return res.sendBad('You do not have the required privelages to access this resource', null, { status: 401});
        }).catch(function(err) {
            res.sendBad(err);
        })
    }
}

module.exports = helper;