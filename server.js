var app = function(inject) {
    var express = require('express');
    var app = express();
    
    [
        "FACEBOOK_CLIENT_ID",
        "FACEBOOK_CLIENT_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_API_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_PUBLISH_KEY",
        "JWT_SECRET_KEY",
        "PORT",
        "DB_CONNECTION_STRING"
    ].forEach(function(configKey) {
        if (!inject.config[configKey])
            throw new Error('Must define config: ' + configKey);
    })
    app.config = inject.config;
    
    app.db = inject.db;
    if (app.db.connect != null && typeof app.db.connect === 'function')
        app.db.connect(app.config.DB_CONNECTION_STRING);
    app.passport = inject.passport(app.db, app.config);
    app.geocoder = require('node-geocoder')('google','https',{
        apiKey: app.config.GOOGLE_API_KEY
    });
    app.stripe = new inject.stripe(app.config.STRIPE_SECRET_KEY);
    app.bodyParser = require('body-parser');
    inject.helper.init(app);
    inject.expressExtensions.init(express);

    app.use(require('cookie-parser')());
    app.use(app.bodyParser.urlencoded({ extended: true }));
    app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
    app.use(app.passport.initialize());
    app.use(app.passport.session());
    app.use(express.static('public'));

    app.userController = new inject.userController(app);
    app.bookingController = new inject.bookingController(app);
    app.lotController = new inject.lotController(app);
    app.spotController = new inject.spotController(app);
    app.authController = new inject.authController(app);
    app.payController = new inject.payController(app);

    app.get('/', app.sendIndex);
    
    global.app = app;
    return app;    
}

app.GetDefaultInjection = function(allowConnect) {
    var inject = {
        config: new (require('./config'))(),
        db: new (require('./app/db'))(),
        helper: new (require('./app/helper'))(),

        expressExtensions: require('./app/express'),
        passport: require('./app/passport'),
        stripe: require('./app/stripe'),

        userController: require('./app/controllers/userController'),
        bookingController: require('./app/controllers/bookingController'),
        spotController: require('./app/controllers/spotController'),
        authController: require('./app/controllers/authController'),
        lotController: require('./app/controllers/lotController'),
        payController: require('./app/controllers/payController')
    }
    if (!allowConnect)
        inject.db.connect = null;
    return inject;
}

if (require.main == module)
    app(app.GetDefaultInjection(true)).start();
else
    module.exports = app;