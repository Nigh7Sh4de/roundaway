module.exports = function(resolveWith, errorWith) {
    return function() {
        return {
            populate: function() {
                return this;
            },
            exec: function() {
                return new Promise(function(resolve, reject) {
                    if (errorWith)
                        reject(errorWith);
                    else
                        resolve(resolveWith);
                });;
            }
        }
    }
}