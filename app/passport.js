module.exports = function(db) {
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
    
    return passport;
}