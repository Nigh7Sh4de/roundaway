var authController = function(app) {
        this.app = app;
        app.get('/logout', this.Logout);

        app.get('/login/:strat', this.Login.bind(this));
        app.get('/login/:strat/return', this.LoginReturn.bind(this));
        app.post('/auth/:strat', app.bodyParser.json(), this.LoggedIn.bind(this));
        app.get('/connect/:strat', this.Connect.bind(this));
        app.get('/connect/:strat/return', this.ConnectReturn.bind(this));

    }

var GenerateCallback = function(redirect, req, res) {
    return redirect ? {
        failureRedirect: '/#/login',
        successRedirect: '/#/home'
    } : 
    function(err, user, info) {
        if (err)
            return res.sendBad(err);
        if (!user)
            return res.sendBad(['User could not be authenticated', info]);
        req.login(user, function(err) {
            if (err)
                return res.sendBad(err);
            res.sendGood('User authenticated successfuly', user);
        })
    }
}

authController.prototype = {
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
    Login: function(req, res, next) {
        var strat = req.params.strat;
        this.app.passport.authenticate(strat, this.strategies[strat].authProps)(req, res, next);
    },
    LoginReturn: function(req, res, next) {
        this.app.passport.authenticate(
            req.params.strat,
            {
                failureRedirect: '/#/login',
                successRedirect: '/#/profile'
            }
        )(req, res, next);
    },
    LoggedIn: function(req, res, next) {
        this.app.passport.authenticate(
            req.params.strat + '-token',  
            GenerateCallback(!req.body.noredirect, req, res)
        )(req, res, next);
    },
    Connect: function(req, res, next) {
        var strat = req.params.strat;
        this.app.passport.authorize(strat, this.strategies[strat].authProps)(req, res, next);
    },
    ConnectReturn: function(req, res, next) {
        this.app.passport.authorize(req.params.strat, {
            failureRedirect: '/#/login',
            successRedirect: '/#/profile'
        })(req, res, next);
    }
    // init: function(app) {
    //     this.app = app;
    //     app.get('/logout', this.Logout);

    //     app.get('/login/google', this.Login('google'));
    //     app.get('/login/google/return', this.LoginReturn('google'));
    //     app.get('/connect/google', this.Connect('google'));
    //     app.get('/connect/google/return', this.ConnectReturn('google'));

    //     app.get('/login/facebook', this.Login('facebook'));
    //     app.get('/login/facebook/return', this.LoginReturn('facebook'));
    //     app.get('/connect/facebook', this.Connect('facebook'));
    //     app.get('/connect/facebook/return', this.ConnectReturn('facebook'));
    // }
}



module.exports = authController;