module.exports = function(db, config) {
    var passport = require('passport');

    var FacebookTokenStrategy = require('passport-facebook-token');
    var GoogleTokenStrategy = require('passport-google-token').Strategy;
    var JwtStrategy = require('passport-jwt').Strategy;
    var ExtractJwt = require('passport-jwt').ExtractJwt;

    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: config.JWT_SECRET_KEY,
        algorithms: ['HS256']
    }, function(profile, cb) {
        db.checkUser('jwt', profile, cb);
    }))

    passport.use(new GoogleTokenStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET
    }, function(accessToken, refreshToken, profile, cb) {
        db.checkUser('google', profile, cb);
    }))
    
    passport.use(new FacebookTokenStrategy({
        clientID: config.FACEBOOK_CLIENT_ID,
        clientSecret: config.FACEBOOK_CLIENT_SECRET
    }, function(accessToken, refreshToken, profile, cb) {
        db.checkUser('facebook', profile, cb);
    }))
    
    return passport;
}