var express = require('express');
var app = express();
var db = require('./db');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/login/google/return',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, cb) {
        GenericStrategy(req, accessToken, refreshToken, profile, cb, 'google')
    }
));
passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/login/facebook/return',
        profileFields: ['id', 'displayName'],
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, cb) {
        GenericStrategy(req, accessToken, refreshToken, profile, cb, 'facebook');
    }
));
var GenericStrategy = function(req, accessToken, refreshToken, profile, cb, strat) {
    if (req.user == null)
        db.checkUser(strat, profile, function(err, res) {
            if (err)
                throw err;
            else {
                return cb(null, res);
            }
        });
    else
        db.connect(req.user, strat, profile, function(err, res) {
            if (err)
                throw err;
            else {
                return cb(null, res);
            }
        });
}

passport.serializeUser(function(user, cb) {
    return cb(null, user.id);
});

passport.deserializeUser(function(obj, cb) {
    db.findById('users', obj, cb);
});

var bodyParser = require('body-parser');

app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.get('/api/users', checkAuth, function(req, res) {
    db.find('users', {}, function(err, docs) {
        if (err != null) {
            return res.send({err: err});
        }
        else {
            return res.send(docs);
        }
    })
})

app.get('/api/profile', checkAuth, function(req, res) {
    return res.send(req.user);
});

app.get('/api/parkades', checkAuth, checkAdmin, function(req, res) {
    db.find('parkades', {}, function(err, docs) {
        return res.send(docs);
    });
});

app.get('/api/parkades/near', checkAuth, checkAdmin, function(req, res)  {
    if (isNaN(req.query.long) || isNaN(req.query.lat))
        return res.send("Got invalid coordinates");

    var coordinates = [
        parseFloat(req.query.long),
        parseFloat(req.query.lat)
    ];

    db.find('parkades', {location: {$near:{$geometry:{ type: "Point", coordinates: coordinates }}}}, function(err, doc) {
        if (err != null)
            return res.send(err);
        else {
            return res.send(doc);
        }
    });

});

app.put('/api/parkades', checkAuth, checkAdmin, bodyParser.json(), function(req, res) {
    if (req.body.address == null)
        return res.send("address cannot be null");
    else if (req.body.coordinates == null || req.body.coordinates == {})
        return res.send("location cannot be null or empty");
    else
        db.createParkade(req.body, function(err) {
            if (err != null)
                return res.send(err);
            else {
                return res.sendStatus(200);
            }
        });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
})

app.get('/login/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/login/google/return',
    passport.authenticate('google', {
        failureRedirect: '/login',
        successRedirect: '/home'
    })
);
app.get('/connect/google', passport.authorize('google', { scope: ['profile'] }));
app.get('/connect/google/return',
    passport.authorize('google', {
        failureRedirect: '/login',
        successRedirect: '/profile'
    })
);

app.get('/login/facebook', passport.authenticate('facebook'));
app.get('/login/facebook/return',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
        successRedirect: '/home'
    })
);
app.get('/connect/facebook', passport.authorize('facebook'));
app.get('/connect/facebook/return',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
        successRedirect: '/profile'
    })
);

app.get('/404', function(req, res) {
    return res.send('404');
});
app.get('/node_modules/angular/angular.js', function(req, res) {
    return res.sendFile(__dirname + '/node_modules/angular/angular.js');
});
app.get('/node_modules/angular-route/angular-route.js', function(req, res) {
    return res.sendFile(__dirname + '/node_modules/angular-route/angular-route.js');
});

app.get('/', checkAuth, sendIndex);
app.get('/home', checkAuth, sendIndex);
app.get('/login', sendIndex);
app.get('/profile', checkAuth, sendIndex);

function sendIndex(req, res) {
    return res.sendFile(__dirname + '/public/index.html');
}

function checkAuth(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

function checkAdmin(req, res, next) {
    if (req.user.admin)
        return next();
    res.redirect('/home');
}

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
