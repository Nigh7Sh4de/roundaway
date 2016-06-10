// var helper = function(obj) {
//     Object.assign(obj, exts);
// }
var expect = require('chai').expect;

var exts = {
    init: function(obj) {
        var x = Object.assign({}, this);
        delete x.init;
        Object.assign(obj, x);
    },

    start: function() {
        this.listen(this.config.PORT, this.started);
    },

    started: function() {
        console.log('Roundaway started on port ' + this.address().port);
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
        try {
            if (a instanceof Array)
                expect(a).to.deep.include.all.members(b);
            else
                expect(a).to.deep.equal(b);
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = exts;