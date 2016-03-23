var express = require('express');
var app = express();
var db = require('./app/db');
var passport = require('./app/passport')(db);
var bodyParser = require('body-parser');

app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

var userController = require('./app/controllers/userController');
var spotController = require('./app/controllers/spotController');
var authController = require('./app/controllers/authController');
userController.init(app, db, checkAuth, checkAdmin);
spotController.init(app, db, checkAuth, checkAdmin, bodyParser);
authController.init(app, db, checkAuth, checkAdmin, passport);

app.get('/', checkAuth, sendIndex);
app.get('/home', checkAuth, sendIndex);
app.get('/login', sendIndex);
app.get('/profile', checkAuth, sendIndex);
app.get('/404', function(req, res) {
    return res.send('404');
});

[
    '/node_modules/angular/angular.js',
    '/node_modules/angular-route/angular-route.js'
].forEach(function (asset) {
    allowGet(asset);
});

function allowGet(file) {
    app.get(file, function(req, res) {
        return res.sendFile(__dirname + file);
    });
}

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
    console.log('App started. Listening on port 8080!');
});
