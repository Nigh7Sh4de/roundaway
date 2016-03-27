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
    init: function(app) {
        this.app = app;
        
        app.get('/api/users', app.checkAuth, app.checkAdmin, this.GetAllUsers(app));
        app.get('/api/users/profile', app.checkAuth, function(req, res) {
            return res.send(Object.assign({}, req.user.profile.toJSON(), {authid: req.user.authid.toJSON()}));
        });
    }
}

module.exports = userController;