var userController = {
    app: null,
    GetAllUsers: function(app) {
        return function(req, res) {
            app.db.find('users', {}, function(err, docs) {
                if (err != null) {
                    return res.send({err: err});
                }
                else {
                    return res.send(docs);
                }
            });
        }
    },
    GetProfileForSessionUser: function() {
        return function(req, res) {
            if (req.user == null)
                return res.send(new Error('Could not get session user.'));
            return res.send(Object.assign({}, req.user.profile.toJSON(), {authid: req.user.authid.toJSON()}));
        }
    },
    AddLotsToUser: function(req, res) {
        if (req.body.lots == null)
            return res.send(new Error('Could not add lots. No lots specified.'));
        var count = 2;
        var i = 0;
        var next = function() {
            if (++i >= count)
                done();
        }
        var done = function() {
            user.addAuth(lots);
        }
        var user = null;
        var lots = null;
        this.app.db.find('users', {id: req.params.userid}, function(err, docs) {
            if (err != null)
                return res.send(err);
            if (doc[0] == null)
                return res.send(new Error('Could not add lot. User not found.'));
            user = doc[0];
            next();
        });
        if (typeof req.body.lots == 'string')
            req.body.lots = [req.body.lots];
        this.app.db.find('lots', {id: {$in: req.body.lots}}, function(err, docs) {
            if (err != null)
                return res.send(err);
            if (docs.length == 0)
                return res.send(new Error('Could not add lot. Lot not found.'));
            lots = docs;
            next();
        })
    },
    init: function(app) {
        this.app = app;
        
        app.get('/api/users', app.checkAuth, app.checkAdmin, this.GetAllUsers(app));
        app.get('/api/users/profile', app.checkAuth, this.GetProfileForSessionUser());
        app.put('/api/users/:userid/lots', app.checkAuth, app.bodyParser.json(), this.AddLotsToUser);
        
    }
}

module.exports = userController;