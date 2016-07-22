var errors = {
    MissingProperty: function(obj, propText, propValue) {
        this.stack = (new Error()).stack;
        var name = obj.constructor.modelName;
        this.message = 'This ' + name + 
                       ' does not have a ' + propText +
                       ' set.';
        var value = propValue === false ? undefined :
            propValue || obj[propText];
        this.missingProperty = value;
    }    
}

for (var error in errors) {
    errors[error].prototype = Object.create(Error.prototype);
    errors[error].prototype.constructor = errors[error];
    errors[error].prototype.name = error;
}

module.exports = errors;