var sinon = require('sinon');

module.exports = function(resolveWith, errorWith, assert, assert_on) {
    return function() {
        var promise = new Promise(function(resolve, reject) {
            if (errorWith)
                reject(errorWith);
            else
                resolve(resolveWith);
        });;
        var returnThis = function() {
            return this;
        }
        var spliceThis = function() {
            resolveWith.splice(1, 1);
            return this;
        }
        promise.populate = sinon.spy(returnThis);
        promise.where = sinon.spy(returnThis);
        promise.and = sinon.spy(returnThis);
        promise.where = sinon.spy(returnThis);
        promise.limit = sinon.spy(spliceThis);
        promise.elemMatch = sinon.spy(spliceThis);
        promise.exec = sinon.spy(returnThis);
        if (assert) {
            if (!assert_on) assert_on = 'exec';
            var fn = promise[assert_on];
            promise[assert_on] = function() {
                assert.apply(this);
                return fn();
            }
        }
        return promise;
    }
}