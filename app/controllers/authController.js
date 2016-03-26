var authController = {
    app: null,
    strategies: {
        google: {
            authProps: { scope: ['profile'] }
        },
        facebook: {}
    },
    Logout: function(req, res) {
        req.logout();
        res.redirect('/');
    },
    Login: function(strat) {
        return this.app.passport.authenticate(strat, this.strategies[strat].authProps);    
    },
    LoginReturn: function(strat) {
        return this.app.passport.authenticate(strat, {
            failureRedirect: '/login',
            successRedirect: '/home'
        })
    },
    Connect: function(strat) {
        return this.app.passport.authorize(strat, this.strategies[strat].authProps);
    },
    ConnectReturn: function(strat) {
        return this.app.passport.authorize(strat, {
            failureRedirect: '/login',
            successRedirect: '/profile'
        })
    },
    init: function(app) {
        this.app = app;
        app.get('/logout', this.Logout);

        app.get('/login/google', this.Login('google'));
        app.get('/login/google/return', this.LoginReturn('google'));
        app.get('/connect/google', this.Connect('google'));
        app.get('/connect/google/return', this.ConnectReturn('google'));

        app.get('/login/facebook', this.Login('facebook'));
        app.get('/login/facebook/return', this.LoginReturn('facebook'));
        app.get('/connect/facebook', this.Connect('facebook'));
        app.get('/connect/facebook/return', this.ConnectReturn('facebook'));
    }
}



module.exports = authController;