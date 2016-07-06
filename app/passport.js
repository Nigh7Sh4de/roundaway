module.exports = function(db, config) {
    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;
    var GoogleStrategy = require('passport-google-oauth20').Strategy;
    var FacebookTokenStrategy = require('passport-facebook-token');
    var GoogleTokenStrategy = require('passport-google-token').Strategy;
    var JwtStrategy = require('passport-jwt').Strategy;
    var ExtractJwt = require('passport-jwt').ExtractJwt;
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: config.JWT_SECRET_KEY,
        algorithms: ['HS256']
    }, function(payload, done) {
        GenericStrategy(null, null, null, payload, done, 'jwt')
    }))
    passport.use(new GoogleTokenStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET
    }, function(accessToken, refreshToken, profile, cb) {
            GenericStrategy(null, accessToken, refreshToken, profile, cb, 'google');
    }))
    passport.use(new FacebookTokenStrategy({
        clientID: config.FACEBOOK_CLIENT_ID,
        clientSecret: config.FACEBOOK_CLIENT_SECRET
    }, function(accessToken, refreshToken, profile, cb) {
            GenericStrategy(null, accessToken, refreshToken, profile, cb, 'facebook');
    }))
    passport.use(new GoogleStrategy({
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: '/login/google/return',
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, cb) {
            GenericStrategy(req, accessToken, refreshToken, profile, cb, 'google')
        }
    ));
    passport.use(new FacebookStrategy({
            clientID: config.FACEBOOK_CLIENT_ID,
            clientSecret: config.FACEBOOK_CLIENT_SECRET,
            callbackURL: '/login/facebook/return',
            profileFields: ['id', 'displayName'],
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, cb) {
            GenericStrategy(req, accessToken, refreshToken, profile, cb, 'facebook');
        }
    ));
    var GenericStrategy = function(req, accessToken, refreshToken, profile, cb, strat) {
        if (strat === 'jwt') {
            db.checkUser('jwt', profile, cb);
        }
        else if (!req || !req.user)
            db.checkUser(strat, profile, function(err, res) {
                if (err)
                    cb(err);
                else {
                    return cb(null, res);
                }
            });
        else
            db.connectUser(req.user, strat, profile, function(err, res) {
                if (err)
                    cb(err);
                else {
                    return cb(null, res);
                }
            });
    }

    passport.serializeUser(function(user, cb) {
        return cb(null, user.id);
    });

    passport.deserializeUser(function(obj, cb) {
        db.users.findById(obj, cb);
    });
    
    return passport;
}