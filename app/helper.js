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
            return res.sendBad(new Errors.Unauthorized());
        
        var slash_api = '/api/'.length;
        var slash = req.url.indexOf('/', slash_api);
        var question = req.url.indexOf('?');
        var uniqueResource = req.route.path.indexOf(':id') >= 0;
        var id = req.url.substr(slash+1, 24);
        var collection;
        if (slash >= 0)
            collection = req.url.substring(slash_api, slash) 
        else if (question >= 0)
            collection = req.url.substring(slash_api, question);
        else
            collection = req.url.substring(slash_api);

        var search = [];
        authRequirements = authRequirements || {};
        if (authRequirements.owner) {
            if (collection === 'users') 
                search.push({_id: req.user.id})
            else
                search.push({user: req.user.id})
        }
        if (authRequirements.attendant)
            search.push({attendants: req.user.id});
        if (!search.length && !req.user.admin)
            return res.sendBad(new Errors.Unauthorized(Object.keys(authRequirements)));

        var query = app.db[collection].find(uniqueResource ? {_id: id} : {});
        if (!req.user.admin)
            query.and([{$or: search}]);
        if (req.query)
            query.and([req.query]);
        query.exec()
        .then(function(docs) {
            if (!docs || !docs.length && !uniqueResource)
                throw new Errors.NotFound(collection, {query: [...search, req.query]});
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