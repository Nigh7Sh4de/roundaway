var express = require('express');
var app = express();
var db = require('./db');

var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
passport.use(new Strategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/login/facebook/return',
        profileFields: ['id', 'displayName']
    },
    function(accessToken, refreshToken, profile, cb) {
        db.checkUser(profile, function(err, res) {
            if (err)
                throw err;
            else {
                return cb(null, res);
            }
        });

    }
));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(obj, cb) {
    db.findById('users', obj, cb);
});

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.get('/api/users', checkAuth, function(req, res) {
    db.find('users', {}, function(err, docs) {
        if (err != null) {
            res.send({err: err});
        }
        else {
            res.send(docs);
        }
    })
})

app.get('/api/profile', checkAuth, function(req, res) {
    res.send(req.user);
})

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
})

app.get('/login/facebook', passport.authenticate('facebook'));

app.get('/login/facebook/return',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/home');
    }
);

app.get('/404', function(req, res) {
    res.send('404');
});
app.get('/node_modules/angular/angular.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/angular/angular.js');
});
app.get('/node_modules/angular-route/angular-route.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/angular-route/angular-route.js');
});

app.get('/', sendIndex);
app.get('/home', sendIndex);
app.get('/login', sendIndex);
app.get('/profile', sendIndex);

function sendIndex(req, res) {
    res.sendFile(__dirname + '/public/index.html');
}

function checkAuth(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
