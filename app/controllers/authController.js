var init = function(app, db, checkAuth, checkAdmin, passport) {
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

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
}

module.exports = {
    init: init
}