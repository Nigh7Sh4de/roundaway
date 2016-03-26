module.exports = function(app) {
    app.allowGet = function(file) {
        app.get(file, function(req, res) {
            return res.sendFile(file, { root: __dirname + '/..' });
        });
    }

    app.sendIndex = function(req, res) {
        return res.sendFile('/public/index.html', { root: __dirname + '/..' });
    }

    app.checkAuth = function(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    }

    app.checkAdmin = function(req, res, next) {
        if (req.user.admin)
            return next();
        res.redirect('/home');
    }
}