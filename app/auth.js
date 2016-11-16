var Errors = require('./errors');
var User = require('./models/User');

var FacebookTokenStrategy = require('passport-facebook-token');
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

const auth = function(db, config) {

    this.checkUser = function(strategy, profile, cb) {
        var search = {};
        search[strategy === 'jwt' ? '_id' : 'authid.' + strategy] = profile.id;
        db.users.findOne(search, function(err, doc) {
            if (err) cb(err);
            else if (doc) cb(null, doc);
            else if (strategy === 'jwt') cb(new Errors.NotFound('User', search));
            else {
                console.log('hi');
                debugger
                search.profile = {
                    name: profile.displayName
                }
                var newUser = new User(search)
                console.log('saving...');
                newUser.save(function(err, user) {
                    console.log('saved');
                    if (err) throw err;
                    return cb(null, user);
                })
            }
        })
    } 

    const strategies = {}

    strategies.jwtStrategy = new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: config.JWT_SECRET_KEY,
        algorithms: ['HS256']
    }, (profile, cb) => {
        this.checkUser('jwt', profile, cb);
    })

    strategies.googleStrategy = new GoogleTokenStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET
    }, (accessToken, refreshToken, profile, cb) => {
        this.checkUser('google', profile, cb);
    })

    strategies.fbStrategy = new FacebookTokenStrategy({
        clientID: config.FACEBOOK_CLIENT_ID,
        clientSecret: config.FACEBOOK_CLIENT_SECRET
    }, (accessToken, refreshToken, profile, cb) => {
        this.checkUser('facebook', profile, cb);
    })
    // const passport = require('passport');

    // for (var strat in strategies)
    //     passport.use(strategies[strat])

    // passport.use(fbStrategy)
    
    return strategies;
}

module.exports = auth