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
        promise.populate = returnThis;
        promise.exec = returnThis;
        return promise;
    }
}