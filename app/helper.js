var Errors = require('./errors')

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

    findResource: function(req, res, next, authRequirements) {
        if (!req.user)
            return res.sendBad('Could not get session user')

        var search = [];
        authRequirements = authRequirements || {};
        if (authRequirements.owner)
            search.push({user: req.user.id});
        if (authRequirements.attendant)
            search.push({attendants: req.user.id});
        if (!search.length && !req.user.admin)
            return res.sendBad('You do not have the required privelages to access this resource', null, {status: 401});

        var slash_api = '/api/'.length;
        var slash = req.url.indexOf('/', slash_api);
        var uniqueResource = slash >= 0;
        var collection = uniqueResource ? req.url.substring(slash_api, slash) : req.url.substring(slash_api);
        var id = req.url.substr(slash+1, 24);

        
        
        var query = app.db[collection].find(uniqueResource ? {_id: id} : {});
        if (!req.user.admin)
            query.and([{$or: search}]);
        query.exec()
        .then(function(docs) {
            if (!docs || !docs.length && !uniqueResource)
                throw new Errors.NotFound(collection, {$or: search});
            else if (uniqueResource)
                req.doc = docs[0];
            else
                req.docs = docs;
            next();
        }).catch(function(err) {
            res.sendBad(err);
        })
    },

    checkAdmin: function(req, res, next) {
        this.findResource(req, res, next);
    },

    checkAttendant: function(req, res, next) {
        this.findResource(req, res, next, {
            owner: true,
            attendant: true
        })
    },

    checkOwner: function(req, res, next) {
        this.findResource(req, res, next, {
            owner: true
        })
    }
}

module.exports = helper;