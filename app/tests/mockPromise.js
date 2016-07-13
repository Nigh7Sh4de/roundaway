module.exports = function(resolveWith, errorWith) {
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
        promise.populate = returnThis;
        promise.exec = returnThis;
        promise.limit = spliceThis;
        promise.elemMatch = spliceThis;
        return promise;
    }
}