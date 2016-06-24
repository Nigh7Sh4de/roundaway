module.exports = function(keys) {
    for (var i=0; i < keys.length; i++)
        this[keys[i]] = keys[i];
}