var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    authid: {
        facebook: String,
        google: String
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.link = function(strat, id, cb) {
    this.authid[strat] = id;
    this.save(cb);
}

userSchema.methods.merge = function(anotherUser, cb) {
    var errors = [];

    userSchema.statics.forEach(function(strat) {
        if (anotherUser.authid[strat] != null) {
            if (this.authid[strat] == null)
                this.authid[strat] = anotherUser.authid[strat];
            else if (this.authid[strat] != anotherUser.authid[strat]) {
                errors.push('The accounts have two different ' + strat + ' logins associated with them. Please unlink one before connecting.')
            }
        }
    }.bind(this));
    if (this.admin || anotherUser.admin)
        this.admin = true;

    if (this.name != null && anotherUser.name != null && this.name != anotherUser.name)
        errors.push('The accounts have different profiles. Please resolve these issues before connecting.');
    else if (this.name == null)
        this.name = anotherUser.name;

    return cb(errors);

}

var User = mongoose.model('User', userSchema);

module.exports = User;
