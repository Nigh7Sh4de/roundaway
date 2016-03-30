var app = function(inject) {
    var express = require('express');
    var app = express();
    app.db = inject.db;
    app.passport = inject.passport(app.db);
    app.bodyParser = require('body-parser');
    inject.helper.init(app);
    // inject.helper(app);


    app.use(require('cookie-parser')());
    app.use(app.bodyParser.urlencoded({ extended: true }));
    app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
    app.use(app.passport.initialize());
    app.use(app.passport.session());
    app.use(express.static('public'));

    app.userController = new inject.userController(app);
    app.spotController = inject.spotController;
    app.authController = new inject.authController(app);
    app.spotController.init(app);
    // app.authController.init(app);

    app.get('/', app.checkAuth, app.sendIndex);
    app.get('/home', app.checkAuth, app.sendIndex);
    app.get('/login', app.sendIndex);
    app.get('/profile', app.checkAuth, app.sendIndex);
    app.get('/404', function(req, res) {
        return res.send('404');
    });

    [
        '/node_modules/angular/angular.js',
        '/node_modules/angular-route/angular-route.js'
    ].forEach(function (asset) {
        app.allowGet(asset);
    });
    
    return app;    
}

app.GetDefaultInjection = function() {
    return {
        db: require('./app/db'),
        passport: require('./app/passport'),
        helper: require('./app/helper'),
        userController: require('./app/controllers/userController'),
        spotController: require('./app/controllers/spotController'),
        authController: require('./app/controllers/authController')
    }
}

if (require.main == module)
    app(app.GetDefaultInjection()).listen(8080, function() {
        console.log('App started. Listening on port 8080!');
    });
else
    module.exports = app;