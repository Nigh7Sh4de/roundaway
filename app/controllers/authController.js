var jwt = require('jsonwebtoken');
var URL = require('url');

var authController = function(app) {
        this.app = app;
        app.get('/logout', this.Logout);

        app.get('/login/:strat', this.Login.bind(this));
        // app.get('/login/return', this.RedirectToLogin.bind(this));
        app.get('/login/:strat/return', this.LoginReturn.bind(this));
        app.post('/auth/:strat', app.bodyParser.json(), this.LoggedIn.bind(this));
        // app.get('/auth/:strat', app.bodyParser.json(), this.LoggedIn.bind(this));
        // app.get('/connect/:strat', this.Connect.bind(this));
        // app.get('/connect/:strat/return', this.ConnectReturn.bind(this));

    }

var GenerateCallback = function(redirect, req, res) {
    var config = this.app.config;
    // redirect = false;
    // return redirect ? {
    //     failureRedirect: '/#/login',
    //     successRedirect: '/#/login/return'
    // } : 
    return function(err, user, info) {
        if (err)
            return res.sendBad(err);
        if (!user)
            return res.sendBad(['User could not be authenticated', info]);
        var token = jwt.sign({id: user.id, profile: user.profile}, config.JWT_SECRET_KEY);
        if (redirect) {
            res.cookie('jwt', token);
            return res.redirect('/#/login');
        }
        res.sendGood('User authenticated successfuly', token, {status: 302});
    };
}

authController.prototype = {
    app: null,
    strategies: {
        google: {
            authProps: { scope: ['profile'] }
        },
        facebook: {}
    },
    GenerateToken: function(req, res) {
        console.log(req);
    },
    Logout: function(req, res) {
        req.logout();
        res.redirect('/');
    },
    RedirectToLogin: function(req, res) {
        console.log('derp');
        res.send("Derp");
        // res.redirect('/');
    },
    Login: function(req, res, next) {
        var strat = req.params.strat;
        // return res.sendBad(null,null,{status: 501});
        // var url = URL.format({
        //     protocol: req.protocol,
        //     host: req.get('host'),
        //     pathname: '/'
        // })
        // url = 'https://www.facebook.com/connect/login_success.html';
        // if (strat == 'facebook')
        //     res.redirect('https://www.facebook.com/dialog/oauth? ' +
        //                  'client_id=' + this.app.config.FACEBOOK_CLIENT_ID + '&' +
        //                  'display=popup&' + 
        //                  'response_type=token&' +
        //                  'redirect_uri=' + url);
        this.app.passport.authenticate(strat, this.strategies[strat].authProps)(req, res, next);
    },
    LoginReturn: function(req, res, next) {
        this.app.passport.authenticate(
            req.params.strat,
            GenerateCallback(true, req, res)
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
}



module.exports = authController;