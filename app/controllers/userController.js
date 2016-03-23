var init = function(app, db, checkAuth, checkAdmin) {
    app.get('/api/users', checkAuth, checkAdmin, function(req, res) {
        db.find('users', {}, function(err, docs) {
            if (err != null) {
                return res.send({err: err});
            }
            else {
                return res.send(docs);
            }
        })
    });
    
    app.get('/api/users/profile', checkAuth, function(req, res) {
        return res.send(req.user);
    });
}

module.exports = {
    init: init
};