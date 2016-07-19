var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    profile: {
        name: String,
        someProp: String
    },
    authid: {
        facebook: String,
        google: String
    },
    admin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSchema.methods.updateProfile = function(profile) {
    return new Promise(function(resolve, reject) {
        for (var prop in profile)
            if (this.schema.tree.profile[prop] === undefined)
                throw 'Schema does not contain a definition for profile field [' + prop + '].';
            else
                this.profile[prop] = profile[prop];
        this.save(function(err, user) {
            if (err) return reject(err);
            else resolve(user);
        })
    }.bind(this));
}

userSchema.methods.addAuth = function(strategy, obj) {
    return new Promise(function(resolve, reject) {
        if (typeof obj === 'function') {
            cb = obj;
            obj = {};
        }
        if (!strategy)
            throw 'Failed to add auth because no strategy was chosen';
        if (typeof strategy !== 'string')
            throw 'Failed to add auth. "' + strategy + '" is not a valid auth.'; 
        if (this.authid[strategy] != null)
            throw 'Failed to add auth for ' + strategy + '. This auth already exists.';
        this.authid[strategy] = obj;
        this.save(function(err, user) {
            if (err) return reject(err);
            else resolve(user);
        })
    }.bind(this));
}

userSchema.methods.removeAuth = function(strategy) {
    return new Promise(function(resolve, reject) {
        if (typeof strategy !== 'string' || strategy == '')
            throw 'Failed to remove auth. "' + strategy + '" is not a valid auth.';
        if (!this.authid[strategy])
            throw 'Failed to remove auth. "' + strategy + '" does not exist.';
        delete this.authid[strategy];
        this.save(function(err, user) {
            if (err) return reject(err);
            else resolve(user);
        })
    }.bind(this));
}

userSchema.methods.getAuth = function(strategy) {
    if (typeof strategy !== 'string' || strategy == '')
        return null;
    if (!this.authid[strategy])
        return null;
    else
        return this.authid[strategy];
}

var User = mongoose.model('User', userSchema);

module.exports = User;
