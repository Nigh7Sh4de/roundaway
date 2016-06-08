// var helper = function(obj) {
//     Object.assign(obj, exts);
// }

var exts = {
    init: function(obj) {
        var x = Object.assign({}, this);
        delete x.init;
        Object.assign(obj, x);
    },
    allowGet: function(file) {
        this.get(file, function(req, res) {
            return res.sendFile(file, { root: __dirname + '/..' });
        });
    },

    sendIndex: function(req, res) {
        return res.sendFile('/public/index.html', { root: __dirname + '/..' });
    },

    checkAuth: function(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    },

    checkAdmin: function(req, res, next) {
        if (req.user.admin)
            return next();
        res.redirect('/home');
    },

    deepCompare: function(a, b) {
        for(var prop in a) {
            if (a[prop] != b[prop])
                return false;
        }
        for (var prop in b) {
            if (b[prop] != a[prop])
                return false;
        }
        return true;
    }
}

module.exports = exts;
// module.exports = Object.assign(helper, exts);